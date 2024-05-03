import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import { BaseLoadBalancer, HttpCodeElb, HttpCodeTarget, IApplicationLoadBalancer, ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IBasicServiceMultiAZObservabilityProps } from "./props/IBasicServiceMultiAZObservabilityProps";
import { Construct } from "constructs";
import { Alarm, AlarmRule, ComparisonOperator, CompositeAlarm, Dashboard, IAlarm, IMetric, MathExpression, Metric, TreatMissingData, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityZoneMapper } from "../utilities/AvailabilityZoneMapper";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { IBasicServiceMultiAZObservability } from "./IBasicServiceMultiAZObservability";
import { OutlierDetectionAlgorithm } from "../utilities/OutlierDetectionAlgorithm";
import { BasicServiceDashboard } from "../dashboards/BasicServiceDashboard";
import { Fn } from "aws-cdk-lib";

export class BasicServiceMultiAZObservability extends Construct implements IBasicServiceMultiAZObservability
{
    
    /**
     * The NAT Gateways being used in the service, each set of NAT Gateways
     * are keyed by their Availability Zone Id
     */
    natGateways?: {[key:string]: CfnNatGateway[]};

    /**
     * The application load balancers being used by the service
     */
    applicationLoadBalancers?: IApplicationLoadBalancer[];

    /**
     * The name of the service
     */
    serviceName: string;

    /**
     * The alarms indicating if an AZ is an outlier for NAT GW
     * packet loss and has isolated impact
     */
    natGWZonalIsolatedImpactAlarms: {[key: string]: IAlarm};

    /**
     * The alarms indicating if an AZ is an outlier for ALB
     * faults and has isolated impact
     */
    albZonalIsolatedImpactAlarms: {[key: string]: IAlarm};

    /**
     * The alarms indicating if an AZ has isolated impact
     * from either ALB or NAT GW metrics
     */
    aggregateZonalIsolatedImpactAlarms: {[key: string]: IAlarm};

    /**
     * The dashboard that is optionally created
     */
    dashboard?: Dashboard;

    constructor(scope: Construct, id: string, props: IBasicServiceMultiAZObservabilityProps)
    {
        super(scope, id);

        // Initialize class properties
        this.serviceName = props.serviceName;
        this.applicationLoadBalancers = props.applicationLoadBalancers;
        this.natGateways = props.natGateways;
        this.natGWZonalIsolatedImpactAlarms = {};
        this.albZonalIsolatedImpactAlarms = {};
        this.aggregateZonalIsolatedImpactAlarms = {};

        // Used to aggregate total fault count for all ALBs in the same AZ
        let faultsPerZone: {[key: string]: IMetric} = {};

        // Collect packet drop metrics for each AZ
        let packetDropsPerZone: {[key: string]: IMetric} = {};

        // Create the AZ mapper resource to translate AZ names to ids
        let azMapper: AvailabilityZoneMapper = new AvailabilityZoneMapper(this, "AvailabilityZoneMapper");

        // Setup key prefix for unique metric math expressions
        let keyPrefix: string = "";

        // Create metrics and alarms for just load balancers if they were provided
        if (this.applicationLoadBalancers !== undefined && this.applicationLoadBalancers != null)
        {
            // Collect total fault count metrics per AZ
            let albZoneFaultCountMetrics: {[key: string]: IMetric[]} = {};

            // Create fault rate alarms per AZ indicating at least 1 ALB
            // in the AZ saw a fault rate that exceeded the threshold
            let faultRatePercentageAlarms: {[key: string]: IAlarm[]} = {};

            // Iterate each ALB
            this.applicationLoadBalancers.forEach(alb => {

                // Iterate each AZ in the VPC
                alb.vpc?.availabilityZones.forEach((az, index) => {
                    // Get next unique key
                    keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

                    let availabilityZoneId: string = azMapper.getAvailabilityZoneId(az);
                    faultRatePercentageAlarms[availabilityZoneId] = [];

                    // 5xx responses from targets
                    let target5xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_5XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });

                    // 5xx responses from ELB
                    let elb5xx: IMetric = alb.metrics.httpCodeElb(HttpCodeElb.ELB_5XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });

                    // 2xx responses from targets
                    let target2xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_2XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });

                    // 3xx responses from targets
                    let target3xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_3XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });

                    // 3xx responess from ELB
                    let elb3xx: IMetric = alb.metrics.httpCodeElb(HttpCodeElb.ELB_3XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });

                    // Create metrics for total fault count from this ALB
                    let usingMetrics: {[key: string]: IMetric} = {};
                    usingMetrics[`${keyPrefix}1`] = target5xx;
                    usingMetrics[`${keyPrefix}2`] = elb5xx;

                    if (albZoneFaultCountMetrics[availabilityZoneId] === undefined || albZoneFaultCountMetrics[availabilityZoneId] == null)
                    {
                        albZoneFaultCountMetrics[availabilityZoneId] = [];
                    }

                    albZoneFaultCountMetrics[availabilityZoneId].push(new MathExpression({
                        expression: `(${keyPrefix}1 + ${keyPrefix}2)`,
                        usingMetrics: usingMetrics,
                        label: availabilityZoneId + " " + alb.loadBalancerArn + " fault count",
                        period: props.period           
                    }));

                    // Create metrics to calculate fault rate for this ALB
                    usingMetrics = {};
                    usingMetrics[`${keyPrefix}1`] = target2xx;
                    usingMetrics[`${keyPrefix}2`] = target3xx;
                    usingMetrics[`${keyPrefix}3`] = elb3xx;
                    usingMetrics[`${keyPrefix}4`] = target5xx;
                    usingMetrics[`${keyPrefix}4`] = elb5xx;

                    // The ALB fault rate
                    let faultRate: IMetric = new MathExpression({
                        expression: `((${keyPrefix}4+${keyPrefix}5)/(${keyPrefix}1+${keyPrefix}2+${keyPrefix}3+${keyPrefix}4+${keyPrefix}5)) * 100`,
                        usingMetrics: usingMetrics,
                        label: availabilityZoneId + " " + alb.loadBalancerArn + " fault rate",
                        period: props.period
                    });

                    let threshold: number = props.faultCountPercentageThreshold ?? 5;

                    // Create a fault rate alarm for the ALB
                    let faultRateAlarm: IAlarm = new Alarm(this, "AZ" + index + keyPrefix + "FaultRatePercentageAlarm", {
                        alarmName: availabilityZoneId + "-" + alb.loadBalancerArn + "-fault-rate",
                        actionsEnabled: false,
                        metric: faultRate,
                        evaluationPeriods: 5,
                        datapointsToAlarm: 3,
                        threshold: threshold,
                        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD
                    });

                    // Add this ALB's fault rate alarm
                    faultRatePercentageAlarms[availabilityZoneId].push(faultRateAlarm);
                });    
            });

            // Iterate AZs for the ALB fault count metrics
            Object.keys(albZoneFaultCountMetrics).forEach(availabilityZoneId => {
                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

                let counter: number = 1;
                let usingMetrics: {[key: string]: IMetric} = {};

                // Add each ALB's fault count metrics to the dictionary
                albZoneFaultCountMetrics[availabilityZoneId].forEach(metric => {
                    usingMetrics[`${keyPrefix}${counter++}`] = metric;
                });

                // Sum the total faults for the availability zone across all ALBs
                let totalFaultsPerZone: IMetric = new MathExpression({
                    expression: Object.keys(usingMetrics).join("+"),
                    usingMetrics: usingMetrics,
                    label: availabilityZoneId + " fault count",
                    period: props.period
                });

                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                counter = 1;

                // Assign the total faults per zone to the dictionary
                faultsPerZone[availabilityZoneId] = totalFaultsPerZone;
            });

            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

            let tmp: {[key: string]: IMetric} = {};
            Object.keys(faultsPerZone).forEach((availabilityZoneId, index) => {
                tmp[`${keyPrefix}${index}`] = faultsPerZone[availabilityZoneId];
            });
            
            // Calculate the total faults in the region by adding all AZs together
            let totalFaults: IMetric = new MathExpression({
                expression: Object.keys(tmp).join("+"),
                usingMetrics: tmp,
                label: Fn.ref("AWS::Region") + " fault count",
                period: props.period
            });

            // Finally, iterate back through each AZ
            Object.keys(faultsPerZone).forEach((availabilityZoneId, index) => {
                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
             
                // Determine if AZ is an outlier for faults by exceeding
                // a static threshold 
                let azIsOutlierForFaults: IAlarm;

                switch (props.outlierDetectionAlgorithm)
                {
                    default:
                    case OutlierDetectionAlgorithm.STATIC:
                        // These metrics will give the percent of faults for the AZ
                        let usingMetrics: {[key: string]: IMetric} = {};
                        usingMetrics[`${keyPrefix}1`] = faultsPerZone[availabilityZoneId];
                        usingMetrics[`${keyPrefix}2`] = totalFaults;

                        azIsOutlierForFaults = new Alarm(this, "AZ" + index + "FaultCountOutlierAlarm", {
                            alarmName: availabilityZoneId + "-fault-count-outlier",
                            metric: new MathExpression({
                                expression: `${keyPrefix}1 / ${keyPrefix}2`,
                                usingMetrics: usingMetrics
                            }),
                            threshold: props.outlierThreshold,
                            evaluationPeriods: 5,
                            datapointsToAlarm: 3,
                            actionsEnabled: false,
                            treatMissingData: TreatMissingData.IGNORE,
                            
                        });
                        break;
                }
                
                // Create isolated AZ impact alarms by determining
                // if the AZ is an outlier for fault count and at least
                // one ALB exceeds the fault rate threshold provided
                this.albZonalIsolatedImpactAlarms[availabilityZoneId] = new CompositeAlarm(this, "AZ" + index + "IsolatedFaultCountImpact", {
                    compositeAlarmName: availabilityZoneId + "-isolated-fault-count-impact",
                    alarmRule: AlarmRule.allOf(
                        azIsOutlierForFaults,
                        AlarmRule.anyOf(
                            ...faultRatePercentageAlarms[availabilityZoneId]
                        )
                    )
                });
            });
        }

        keyPrefix = AvailabilityAndLatencyMetrics.nextChar("");

        // Create NAT Gateway metrics and alarms
        if (this.natGateways !== undefined && this.natGateways != null)
        {
            // Collect alarms for packet drops exceeding a threshold per NAT GW
            let packetDropPercentageAlarms: {[key: string]: IAlarm[]} = {};

            // For each AZ, create metrics for each NAT GW
            Object.entries(this.natGateways).forEach((entry, index) => {
                // The number of packet drops for each NAT GW in the AZ
                let packetDropMetricsForAZ: {[key: string]: IMetric} = {};
                let availabilityZoneId = azMapper.getAvailabilityZoneId(entry[0]);
                packetDropPercentageAlarms[availabilityZoneId] = [];

                // Iterate through each NAT GW in the current AZ 
                entry[1].forEach(natgw => {

                    // Calculate packet drops
                    let packetDropCount: IMetric = new Metric({
                        metricName: "PacketsDropCount",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: Unit.COUNT,
                        label: availabilityZoneId + " packet drops",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });

                    // Calculate packets in from source
                    let packetsInFromSourceCount: IMetric = new Metric({
                        metricName: "PacketsInFromSource",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: Unit.COUNT,
                        label: availabilityZoneId + " packets in from source",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });

                    // Calculate packets in from destination
                    let packetsInFromDestinationCount: IMetric = new Metric({
                        metricName: "PacketsInFromDestination",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: Unit.COUNT,
                        label: availabilityZoneId + " packets in from destination",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });

                    let usingMetrics: {[key: string]: IMetric} = {};
                    usingMetrics[`${keyPrefix}1`] = packetDropCount;
                    usingMetrics[`${keyPrefix}2`] = packetsInFromSourceCount;
                    usingMetrics[`${keyPrefix}3`] = packetsInFromDestinationCount;

                    // Calculate a percentage of dropped packets for the NAT GW
                    let packetDropPercentage: IMetric = new MathExpression({
                        expression: `(${keyPrefix}1 / (${keyPrefix}2 + ${keyPrefix}3)) * 100`,
                        usingMetrics: usingMetrics,
                        label: availabilityZoneId + " packet drop percentage",
                        period: props.period
                    });

                    let threshold: number = props.faultCountPercentageThreshold ?? 5;

                    // Create an alarm for this NAT GW if packet drops exceed the specified threshold
                    let packetDropImpactAlarm: IAlarm = new Alarm(this, "AZ" + (index + 1) + "PacketDropImpactAlarm", {
                        alarmName: availabilityZoneId + "-" + natgw.attrNatGatewayId + "-packet-drop-impact",
                        actionsEnabled: false,
                        metric: packetDropPercentage,
                        threshold: threshold,
                        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
                        evaluationPeriods: 5,
                        datapointsToAlarm: 3
                    });

                    // Collect all of the packet drop impact alarms for each
                    // NAT GW in this AZ, need to know at least 1 sees substantial
                    // enough impact to consider the AZ as impaired
                    packetDropPercentageAlarms[availabilityZoneId].push(packetDropImpactAlarm);

                    // Collect the packet drop metrics for this AZ so we can
                    // add them all together and count total packet drops
                    // for all NAT GWs in the AZ
                    packetDropMetricsForAZ[`m${index}`] = packetDropCount;
                });

                // Create a metric that adds up all packets drops from each
                // NAT GW in the AZ
                let packetDropsInThisAZ: IMetric = new MathExpression({
                    expression: Object.keys(packetDropMetricsForAZ).join("+"),
                    usingMetrics: packetDropMetricsForAZ,
                    label: availabilityZoneId + " dropped packets",
                    period: props.period
                });

                // Record these so we can add them up
                // and get a total amount of packet drops
                // in the region across all AZs
                packetDropsPerZone[availabilityZoneId] = packetDropsInThisAZ;
            });

            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

            let tmp: {[key: string]: IMetric} = {};
            Object.keys(packetDropsPerZone).forEach((availabilityZoneId, index) => {
                tmp[`${keyPrefix}${index}`] = packetDropsPerZone[availabilityZoneId];
            });

            // Calculate total packet drops for the region
            let totalPacketDrops: IMetric = new MathExpression({
                expression: Object.keys(tmp).join("+"),
                usingMetrics: tmp,
                label: Fn.ref("AWS::Region") + " dropped packets",
                period: props.period
            });

            // Create outlier detection alarms by comparing packet
            // drops in one AZ versus total packet drops in the region
            Object.keys(packetDropsPerZone).forEach((availabilityZoneId, index) => {
                
                let azIsOutlierForPacketDrops: IAlarm;
                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

                switch (props.outlierDetectionAlgorithm)
                {
                    default:
                    case OutlierDetectionAlgorithm.STATIC:
                        let usingMetrics: {[key: string]: IMetric } = {};
                        usingMetrics[`${keyPrefix}1`] = packetDropsPerZone[availabilityZoneId];
                        usingMetrics[`${keyPrefix}2`] = totalPacketDrops;

                        azIsOutlierForPacketDrops = new Alarm(this, "AZ" + index + "NATGWDroppedPacketsOutlierAlarm", {
                            metric: new MathExpression({
                                expression: `(${keyPrefix}1 / ${keyPrefix}2) * 100`,
                                usingMetrics: usingMetrics,
                                label: availabilityZoneId + " percentage of dropped packets"
                            }),
                            alarmName: availabilityZoneId + "-dropped-packets-outlier",
                            evaluationPeriods: 5,
                            datapointsToAlarm: 3,
                            threshold: props.outlierThreshold
                        });

                        break;
                }

                // In addition to being an outlier for packet drops, make sure
                // the packet loss is substantial enough to trigger the alarm
                // by making sure at least 1 NAT GW sees packet loss more than 0.01%
                let azIsOutlierAndSeesImpact: IAlarm = new CompositeAlarm(this, "AZ" + index + "NATGWIsolatedImpact", {
                    compositeAlarmName: availabilityZoneId + "-isolated-natgw-impact",
                    alarmRule: AlarmRule.allOf(
                        azIsOutlierForPacketDrops,
                        AlarmRule.anyOf(...packetDropPercentageAlarms[availabilityZoneId])
                    )
                });

                // Record these so they can be used in dashboard or for combination
                // with AZ
                this.natGWZonalIsolatedImpactAlarms[availabilityZoneId] = azIsOutlierAndSeesImpact;
            });
        }

        // Go through the ALB zonal isolated impact alarms and see if there is a NAT GW
        // isolated impact alarm for the same AZ ID, if so, create a composite alarm with both
        // otherwise create a composite alarm with just the ALB
        Object.keys(this.albZonalIsolatedImpactAlarms).forEach((availabilityZoneId, index) => {             
            let tmp: IAlarm[] = [];
            tmp.push(this.albZonalIsolatedImpactAlarms[availabilityZoneId]);
            if (this.natGWZonalIsolatedImpactAlarms[availabilityZoneId] !== undefined && this.natGWZonalIsolatedImpactAlarms[availabilityZoneId] != null)
            {
                tmp.push(this.natGWZonalIsolatedImpactAlarms[availabilityZoneId]);
            }
            this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] = new CompositeAlarm(this, "AZ" + index + "AggregateIsolatedImpactAlarm", {
                compositeAlarmName: availabilityZoneId + "-aggregate-isolated-impact",
                alarmRule: AlarmRule.anyOf(...tmp),
                actionsEnabled: false
            });
        });

        // In case there were AZs with only a NAT GW and no ALB, create a composite alarm
        // for the NAT GW metrics
        Object.keys(this.natGWZonalIsolatedImpactAlarms).forEach((availabilityZoneId, index) => {
            // If we don't yet have an isolated impact alarm for this AZ, proceed
            if (this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] === undefined || this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] == null)
            {
                let tmp: IAlarm[] = [];
                tmp.push(this.natGWZonalIsolatedImpactAlarms[availabilityZoneId]);
                if (this.albZonalIsolatedImpactAlarms[availabilityZoneId] !== undefined && this.albZonalIsolatedImpactAlarms != null)
                {
                    tmp.push(this.albZonalIsolatedImpactAlarms[availabilityZoneId]);
                }
                this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] = new CompositeAlarm(this, "AZ" + index + "AggregateIsolatedImpactAlarm", {
                    compositeAlarmName: availabilityZoneId + "-aggregate-isolated-impact",
                    alarmRule: AlarmRule.anyOf(...tmp),
                    actionsEnabled: false
                });
            }
        });

        if (props.createDashboard == true)
        {
            this.dashboard = new BasicServiceDashboard(this, "BasicServiceDashboard", {
                serviceName: props.serviceName + Fn.sub("-availability-${AWS::Region"),
                zonalAggregateIsolatedImpactAlarms: this.aggregateZonalIsolatedImpactAlarms,
                zonalLoadBalancerIsolatedImpactAlarms: this.albZonalIsolatedImpactAlarms,
                zonalNatGatewayIsolatedImpactAlarms: this.natGWZonalIsolatedImpactAlarms,
                interval: props.interval,
                zonalLoadBalancerFaultRateMetrics: faultsPerZone,
                zonalNatGatewayPacketDropMetrics: packetDropsPerZone
            }).dashboard;
        }
    }
}