"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicServiceMultiAZObservability = void 0;
const aws_elasticloadbalancingv2_1 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const constructs_1 = require("constructs");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const AvailabilityZoneMapper_1 = require("../utilities/AvailabilityZoneMapper");
const AvailabilityAndLatencyMetrics_1 = require("../metrics/AvailabilityAndLatencyMetrics");
const OutlierDetectionAlgorithm_1 = require("../utilities/OutlierDetectionAlgorithm");
const BasicServiceDashboard_1 = require("../dashboards/BasicServiceDashboard");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class BasicServiceMultiAZObservability extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        // Initialize class properties
        this.serviceName = props.serviceName;
        this.applicationLoadBalancers = props.applicationLoadBalancers;
        this.natGateways = props.natGateways;
        this.natGWZonalIsolatedImpactAlarms = {};
        this.albZonalIsolatedImpactAlarms = {};
        this.aggregateZonalIsolatedImpactAlarms = {};
        // Used to aggregate total fault count for all ALBs in the same AZ
        let faultsPerZone = {};
        // Collect packet drop metrics for each AZ
        let packetDropsPerZone = {};
        // Create the AZ mapper resource to translate AZ names to ids
        let azMapper = new AvailabilityZoneMapper_1.AvailabilityZoneMapper(this, "AvailabilityZoneMapper");
        // Setup key prefix for unique metric math expressions
        let keyPrefix = "";
        // Create metrics and alarms for just load balancers if they were provided
        if (this.applicationLoadBalancers !== undefined && this.applicationLoadBalancers != null) {
            // Collect total fault count metrics per AZ
            let albZoneFaultCountMetrics = {};
            // Create fault rate alarms per AZ indicating at least 1 ALB
            // in the AZ saw a fault rate that exceeded the threshold
            let faultRatePercentageAlarms = {};
            // Iterate each ALB
            this.applicationLoadBalancers.forEach(alb => {
                // Iterate each AZ in the VPC
                alb.vpc?.availabilityZones.forEach((az, index) => {
                    // Get next unique key
                    keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                    let availabilityZoneId = azMapper.availabilityZoneId(az);
                    faultRatePercentageAlarms[availabilityZoneId] = [];
                    // 5xx responses from targets
                    let target5xx = alb.metrics.httpCodeTarget(aws_elasticloadbalancingv2_1.HttpCodeTarget.TARGET_5XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": alb.loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });
                    // 5xx responses from ELB
                    let elb5xx = alb.metrics.httpCodeElb(aws_elasticloadbalancingv2_1.HttpCodeElb.ELB_5XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": alb.loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });
                    // 2xx responses from targets
                    let target2xx = alb.metrics.httpCodeTarget(aws_elasticloadbalancingv2_1.HttpCodeTarget.TARGET_2XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": alb.loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });
                    // 3xx responses from targets
                    let target3xx = alb.metrics.httpCodeTarget(aws_elasticloadbalancingv2_1.HttpCodeTarget.TARGET_3XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": alb.loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });
                    // 3xx responess from ELB
                    let elb3xx = alb.metrics.httpCodeElb(aws_elasticloadbalancingv2_1.HttpCodeElb.ELB_3XX_COUNT, {
                        dimensionsMap: {
                            "AvailabilityZone": az,
                            "LoadBalancer": alb.loadBalancerFullName
                        },
                        label: availabilityZoneId,
                        period: props.period
                    });
                    // Create metrics for total fault count from this ALB
                    let usingMetrics = {};
                    usingMetrics[`${keyPrefix}1`] = target5xx;
                    usingMetrics[`${keyPrefix}2`] = elb5xx;
                    if (albZoneFaultCountMetrics[availabilityZoneId] === undefined || albZoneFaultCountMetrics[availabilityZoneId] == null) {
                        albZoneFaultCountMetrics[availabilityZoneId] = [];
                    }
                    albZoneFaultCountMetrics[availabilityZoneId].push(new aws_cloudwatch_1.MathExpression({
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
                    usingMetrics[`${keyPrefix}5`] = elb5xx;
                    // The ALB fault rate
                    let faultRate = new aws_cloudwatch_1.MathExpression({
                        expression: `((${keyPrefix}4+${keyPrefix}5)/(${keyPrefix}1+${keyPrefix}2+${keyPrefix}3+${keyPrefix}4+${keyPrefix}5)) * 100`,
                        usingMetrics: usingMetrics,
                        label: availabilityZoneId + " " + alb.loadBalancerArn + " fault rate",
                        period: props.period
                    });
                    let threshold = props.faultCountPercentageThreshold ?? 5;
                    // Create a fault rate alarm for the ALB
                    let faultRateAlarm = new aws_cloudwatch_1.Alarm(this, "AZ" + index + keyPrefix + "FaultRatePercentageAlarm", {
                        alarmName: availabilityZoneId + "-" + alb.loadBalancerArn + "-fault-rate",
                        actionsEnabled: false,
                        metric: faultRate,
                        evaluationPeriods: 5,
                        datapointsToAlarm: 3,
                        threshold: threshold,
                        comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD
                    });
                    // Add this ALB's fault rate alarm
                    faultRatePercentageAlarms[availabilityZoneId].push(faultRateAlarm);
                });
            });
            // Iterate AZs for the ALB fault count metrics
            Object.keys(albZoneFaultCountMetrics).forEach(availabilityZoneId => {
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                let counter = 1;
                let usingMetrics = {};
                // Add each ALB's fault count metrics to the dictionary
                albZoneFaultCountMetrics[availabilityZoneId].forEach(metric => {
                    usingMetrics[`${keyPrefix}${counter++}`] = metric;
                });
                // Sum the total faults for the availability zone across all ALBs
                let totalFaultsPerZone = new aws_cloudwatch_1.MathExpression({
                    expression: Object.keys(usingMetrics).join("+"),
                    usingMetrics: usingMetrics,
                    label: availabilityZoneId + " fault count",
                    period: props.period
                });
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                counter = 1;
                // Assign the total faults per zone to the dictionary
                faultsPerZone[availabilityZoneId] = totalFaultsPerZone;
            });
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
            let tmp = {};
            Object.keys(faultsPerZone).forEach((availabilityZoneId, index) => {
                tmp[`${keyPrefix}${index}`] = faultsPerZone[availabilityZoneId];
            });
            // Calculate the total faults in the region by adding all AZs together
            let totalFaults = new aws_cloudwatch_1.MathExpression({
                expression: Object.keys(tmp).join("+"),
                usingMetrics: tmp,
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " fault count",
                period: props.period
            });
            // Finally, iterate back through each AZ
            Object.keys(faultsPerZone).forEach((availabilityZoneId, index) => {
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                // Determine if AZ is an outlier for faults by exceeding
                // a static threshold 
                let azIsOutlierForFaults;
                switch (props.outlierDetectionAlgorithm) {
                    default:
                    case OutlierDetectionAlgorithm_1.OutlierDetectionAlgorithm.STATIC:
                        // These metrics will give the percent of faults for the AZ
                        let usingMetrics = {};
                        usingMetrics[`${keyPrefix}1`] = faultsPerZone[availabilityZoneId];
                        usingMetrics[`${keyPrefix}2`] = totalFaults;
                        azIsOutlierForFaults = new aws_cloudwatch_1.Alarm(this, "AZ" + index + "FaultCountOutlierAlarm", {
                            alarmName: availabilityZoneId + "-fault-count-outlier",
                            metric: new aws_cloudwatch_1.MathExpression({
                                expression: `${keyPrefix}1 / ${keyPrefix}2`,
                                usingMetrics: usingMetrics
                            }),
                            threshold: props.outlierThreshold,
                            evaluationPeriods: 5,
                            datapointsToAlarm: 3,
                            actionsEnabled: false,
                            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
                        });
                        break;
                }
                // Create isolated AZ impact alarms by determining
                // if the AZ is an outlier for fault count and at least
                // one ALB exceeds the fault rate threshold provided
                this.albZonalIsolatedImpactAlarms[availabilityZoneId] = new aws_cloudwatch_1.CompositeAlarm(this, "AZ" + index + "IsolatedFaultCountImpact", {
                    compositeAlarmName: availabilityZoneId + "-isolated-fault-count-impact",
                    alarmRule: aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForFaults, aws_cloudwatch_1.AlarmRule.anyOf(...faultRatePercentageAlarms[availabilityZoneId]))
                });
            });
        }
        keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar("");
        // Create NAT Gateway metrics and alarms
        if (this.natGateways !== undefined && this.natGateways != null) {
            // Collect alarms for packet drops exceeding a threshold per NAT GW
            let packetDropPercentageAlarms = {};
            // For each AZ, create metrics for each NAT GW
            Object.entries(this.natGateways).forEach((entry, index) => {
                // The number of packet drops for each NAT GW in the AZ
                let packetDropMetricsForAZ = {};
                let availabilityZoneId = azMapper.availabilityZoneId(entry[0]);
                packetDropPercentageAlarms[availabilityZoneId] = [];
                // Iterate through each NAT GW in the current AZ 
                entry[1].forEach(natgw => {
                    // Calculate packet drops
                    let packetDropCount = new aws_cloudwatch_1.Metric({
                        metricName: "PacketsDropCount",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: aws_cloudwatch_1.Unit.COUNT,
                        label: availabilityZoneId + " packet drops",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });
                    // Calculate packets in from source
                    let packetsInFromSourceCount = new aws_cloudwatch_1.Metric({
                        metricName: "PacketsInFromSource",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: aws_cloudwatch_1.Unit.COUNT,
                        label: availabilityZoneId + " packets in from source",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });
                    // Calculate packets in from destination
                    let packetsInFromDestinationCount = new aws_cloudwatch_1.Metric({
                        metricName: "PacketsInFromDestination",
                        namespace: "AWS/NATGateway",
                        statistic: "Sum",
                        unit: aws_cloudwatch_1.Unit.COUNT,
                        label: availabilityZoneId + " packets in from destination",
                        dimensionsMap: {
                            "NatGatewayId": natgw.attrNatGatewayId
                        },
                        period: props.period
                    });
                    let usingMetrics = {};
                    usingMetrics[`${keyPrefix}1`] = packetDropCount;
                    usingMetrics[`${keyPrefix}2`] = packetsInFromSourceCount;
                    usingMetrics[`${keyPrefix}3`] = packetsInFromDestinationCount;
                    // Calculate a percentage of dropped packets for the NAT GW
                    let packetDropPercentage = new aws_cloudwatch_1.MathExpression({
                        expression: `(${keyPrefix}1 / (${keyPrefix}2 + ${keyPrefix}3)) * 100`,
                        usingMetrics: usingMetrics,
                        label: availabilityZoneId + " packet drop percentage",
                        period: props.period
                    });
                    let threshold = props.packetLossImpactPercentageThreshold ?? 0.01;
                    // Create an alarm for this NAT GW if packet drops exceed the specified threshold
                    let packetDropImpactAlarm = new aws_cloudwatch_1.Alarm(this, "AZ" + (index + 1) + "PacketDropImpactAlarm", {
                        alarmName: availabilityZoneId + "-" + natgw.attrNatGatewayId + "-packet-drop-impact",
                        actionsEnabled: false,
                        metric: packetDropPercentage,
                        threshold: threshold,
                        comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
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
                let packetDropsInThisAZ = new aws_cloudwatch_1.MathExpression({
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
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
            let tmp = {};
            Object.keys(packetDropsPerZone).forEach((availabilityZoneId, index) => {
                tmp[`${keyPrefix}${index}`] = packetDropsPerZone[availabilityZoneId];
            });
            // Calculate total packet drops for the region
            let totalPacketDrops = new aws_cloudwatch_1.MathExpression({
                expression: Object.keys(tmp).join("+"),
                usingMetrics: tmp,
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " dropped packets",
                period: props.period
            });
            // Create outlier detection alarms by comparing packet
            // drops in one AZ versus total packet drops in the region
            Object.keys(packetDropsPerZone).forEach((availabilityZoneId, index) => {
                let azIsOutlierForPacketDrops;
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                switch (props.outlierDetectionAlgorithm) {
                    default:
                    case OutlierDetectionAlgorithm_1.OutlierDetectionAlgorithm.STATIC:
                        let usingMetrics = {};
                        usingMetrics[`${keyPrefix}1`] = packetDropsPerZone[availabilityZoneId];
                        usingMetrics[`${keyPrefix}2`] = totalPacketDrops;
                        azIsOutlierForPacketDrops = new aws_cloudwatch_1.Alarm(this, "AZ" + index + "NATGWDroppedPacketsOutlierAlarm", {
                            metric: new aws_cloudwatch_1.MathExpression({
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
                let azIsOutlierAndSeesImpact = new aws_cloudwatch_1.CompositeAlarm(this, "AZ" + index + "NATGWIsolatedImpact", {
                    compositeAlarmName: availabilityZoneId + "-isolated-natgw-impact",
                    alarmRule: aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForPacketDrops, aws_cloudwatch_1.AlarmRule.anyOf(...packetDropPercentageAlarms[availabilityZoneId]))
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
            let tmp = [];
            tmp.push(this.albZonalIsolatedImpactAlarms[availabilityZoneId]);
            if (this.natGWZonalIsolatedImpactAlarms[availabilityZoneId] !== undefined && this.natGWZonalIsolatedImpactAlarms[availabilityZoneId] != null) {
                tmp.push(this.natGWZonalIsolatedImpactAlarms[availabilityZoneId]);
            }
            this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] = new aws_cloudwatch_1.CompositeAlarm(this, "AZ" + index + "AggregateIsolatedImpactAlarm", {
                compositeAlarmName: availabilityZoneId + "-aggregate-isolated-impact",
                alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(...tmp),
                actionsEnabled: false
            });
        });
        // In case there were AZs with only a NAT GW and no ALB, create a composite alarm
        // for the NAT GW metrics
        Object.keys(this.natGWZonalIsolatedImpactAlarms).forEach((availabilityZoneId, index) => {
            // If we don't yet have an isolated impact alarm for this AZ, proceed
            if (this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] === undefined || this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] == null) {
                let tmp = [];
                tmp.push(this.natGWZonalIsolatedImpactAlarms[availabilityZoneId]);
                if (this.albZonalIsolatedImpactAlarms[availabilityZoneId] !== undefined && this.albZonalIsolatedImpactAlarms != null) {
                    tmp.push(this.albZonalIsolatedImpactAlarms[availabilityZoneId]);
                }
                this.aggregateZonalIsolatedImpactAlarms[availabilityZoneId] = new aws_cloudwatch_1.CompositeAlarm(this, "AZ" + index + "AggregateIsolatedImpactAlarm", {
                    compositeAlarmName: availabilityZoneId + "-aggregate-isolated-impact",
                    alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(...tmp),
                    actionsEnabled: false
                });
            }
        });
        if (props.createDashboard == true) {
            this.dashboard = new BasicServiceDashboard_1.BasicServiceDashboard(this, "BasicServiceDashboard", {
                serviceName: props.serviceName + aws_cdk_lib_1.Fn.sub("-availability-${AWS::Region"),
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
exports.BasicServiceMultiAZObservability = BasicServiceMultiAZObservability;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzaWNTZXJ2aWNlTXVsdGlBWk9ic2VydmFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCYXNpY1NlcnZpY2VNdWx0aUFaT2JzZXJ2YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1RkFBa0o7QUFFbEosMkNBQXVDO0FBQ3ZDLCtEQUE4SztBQUM5SyxnRkFBNkU7QUFDN0UsNEZBQXlGO0FBRXpGLHNGQUFtRjtBQUNuRiwrRUFBNEU7QUFDNUUsNkNBQWlDO0FBRWpDLE1BQWEsZ0NBQWlDLFNBQVEsc0JBQVM7SUEwQzNELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEM7UUFFbEYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQ3JDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUMsd0JBQXdCLENBQUM7UUFDL0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQ3JDLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLDRCQUE0QixHQUFHLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsa0NBQWtDLEdBQUcsRUFBRSxDQUFDO1FBRTdDLGtFQUFrRTtRQUNsRSxJQUFJLGFBQWEsR0FBNkIsRUFBRSxDQUFDO1FBRWpELDBDQUEwQztRQUMxQyxJQUFJLGtCQUFrQixHQUE2QixFQUFFLENBQUM7UUFFdEQsNkRBQTZEO1FBQzdELElBQUksUUFBUSxHQUEyQixJQUFJLCtDQUFzQixDQUFDLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBRWxHLHNEQUFzRDtRQUN0RCxJQUFJLFNBQVMsR0FBVyxFQUFFLENBQUM7UUFFM0IsMEVBQTBFO1FBQzFFLElBQUksSUFBSSxDQUFDLHdCQUF3QixLQUFLLFNBQVMsSUFB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UyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQztvQkFDbEMsY0FBYyxFQUFFLEtBQUs7aUJBQ3hCLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQ2pDLENBQUM7WUFDRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksNkNBQXFCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO2dCQUN0RSxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVcsR0FBRyxnQkFBRSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQztnQkFDdEUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLGtDQUFrQztnQkFDM0UscUNBQXFDLEVBQUUsSUFBSSxDQUFDLDRCQUE0QjtnQkFDeEUsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLDhCQUE4QjtnQkFDeEUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO2dCQUN4QixpQ0FBaUMsRUFBRSxhQUFhO2dCQUNoRCxnQ0FBZ0MsRUFBRSxrQkFBa0I7YUFDdkQsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBbmZELDRFQW1mQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENmbk5hdEdhdGV3YXkgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0IHsgQmFzZUxvYWRCYWxhbmNlciwgSHR0cENvZGVFbGIsIEh0dHBDb2RlVGFyZ2V0LCBJQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIsIElMb2FkQmFsYW5jZXJWMiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2MlwiO1xuaW1wb3J0IHsgQmFzaWNTZXJ2aWNlTXVsdGlBWk9ic2VydmFiaWxpdHlQcm9wcyB9IGZyb20gXCIuL3Byb3BzL0Jhc2ljU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5UHJvcHNcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBBbGFybSwgQWxhcm1SdWxlLCBDb21wYXJpc29uT3BlcmF0b3IsIENvbXBvc2l0ZUFsYXJtLCBEYXNoYm9hcmQsIElBbGFybSwgSU1ldHJpYywgTWF0aEV4cHJlc3Npb24sIE1ldHJpYywgVHJlYXRNaXNzaW5nRGF0YSwgVW5pdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgQXZhaWxhYmlsaXR5Wm9uZU1hcHBlciB9IGZyb20gXCIuLi91dGlsaXRpZXMvQXZhaWxhYmlsaXR5Wm9uZU1hcHBlclwiO1xuaW1wb3J0IHsgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MgfSBmcm9tIFwiLi4vbWV0cmljcy9BdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljc1wiO1xuaW1wb3J0IHsgSUJhc2ljU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5IH0gZnJvbSBcIi4vSUJhc2ljU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5XCI7XG5pbXBvcnQgeyBPdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtIH0gZnJvbSBcIi4uL3V0aWxpdGllcy9PdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtXCI7XG5pbXBvcnQgeyBCYXNpY1NlcnZpY2VEYXNoYm9hcmQgfSBmcm9tIFwiLi4vZGFzaGJvYXJkcy9CYXNpY1NlcnZpY2VEYXNoYm9hcmRcIjtcbmltcG9ydCB7IEZuIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmV4cG9ydCBjbGFzcyBCYXNpY1NlcnZpY2VNdWx0aUFaT2JzZXJ2YWJpbGl0eSBleHRlbmRzIENvbnN0cnVjdCBpbXBsZW1lbnRzIElCYXNpY1NlcnZpY2VNdWx0aUFaT2JzZXJ2YWJpbGl0eVxue1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBOQVQgR2F0ZXdheXMgYmVpbmcgdXNlZCBpbiB0aGUgc2VydmljZSwgZWFjaCBzZXQgb2YgTkFUIEdhdGV3YXlzXG4gICAgICogYXJlIGtleWVkIGJ5IHRoZWlyIEF2YWlsYWJpbGl0eSBab25lIElkXG4gICAgICovXG4gICAgbmF0R2F0ZXdheXM/OiB7W2tleTpzdHJpbmddOiBDZm5OYXRHYXRld2F5W119O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFwcGxpY2F0aW9uIGxvYWQgYmFsYW5jZXJzIGJlaW5nIHVzZWQgYnkgdGhlIHNlcnZpY2VcbiAgICAgKi9cbiAgICBhcHBsaWNhdGlvbkxvYWRCYWxhbmNlcnM/OiBJQXBwbGljYXRpb25Mb2FkQmFsYW5jZXJbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBzZXJ2aWNlXG4gICAgICovXG4gICAgc2VydmljZU5hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoZSBhbGFybXMgaW5kaWNhdGluZyBpZiBhbiBBWiBpcyBhbiBvdXRsaWVyIGZvciBOQVQgR1dcbiAgICAgKiBwYWNrZXQgbG9zcyBhbmQgaGFzIGlzb2xhdGVkIGltcGFjdFxuICAgICAqL1xuICAgIG5hdEdXWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtczoge1trZXk6IHN0cmluZ106IElBbGFybX07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYWxhcm1zIGluZGljYXRpbmcgaWYgYW4gQVogaXMgYW4gb3V0bGllciBmb3IgQUxCXG4gICAgICogZmF1bHRzIGFuZCBoYXMgaXNvbGF0ZWQgaW1wYWN0XG4gICAgICovXG4gICAgYWxiWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtczoge1trZXk6IHN0cmluZ106IElBbGFybX07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYWxhcm1zIGluZGljYXRpbmcgaWYgYW4gQVogaGFzIGlzb2xhdGVkIGltcGFjdFxuICAgICAqIGZyb20gZWl0aGVyIEFMQiBvciBOQVQgR1cgbWV0cmljc1xuICAgICAqL1xuICAgIGFnZ3JlZ2F0ZVpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXM6IHtba2V5OiBzdHJpbmddOiBJQWxhcm19O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGRhc2hib2FyZCB0aGF0IGlzIG9wdGlvbmFsbHkgY3JlYXRlZFxuICAgICAqL1xuICAgIGRhc2hib2FyZD86IERhc2hib2FyZDtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBCYXNpY1NlcnZpY2VNdWx0aUFaT2JzZXJ2YWJpbGl0eVByb3BzKVxuICAgIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGNsYXNzIHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5zZXJ2aWNlTmFtZSA9IHByb3BzLnNlcnZpY2VOYW1lO1xuICAgICAgICB0aGlzLmFwcGxpY2F0aW9uTG9hZEJhbGFuY2VycyA9IHByb3BzLmFwcGxpY2F0aW9uTG9hZEJhbGFuY2VycztcbiAgICAgICAgdGhpcy5uYXRHYXRld2F5cyA9IHByb3BzLm5hdEdhdGV3YXlzO1xuICAgICAgICB0aGlzLm5hdEdXWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtcyA9IHt9O1xuICAgICAgICB0aGlzLmFsYlpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXMgPSB7fTtcbiAgICAgICAgdGhpcy5hZ2dyZWdhdGVab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zID0ge307XG5cbiAgICAgICAgLy8gVXNlZCB0byBhZ2dyZWdhdGUgdG90YWwgZmF1bHQgY291bnQgZm9yIGFsbCBBTEJzIGluIHRoZSBzYW1lIEFaXG4gICAgICAgIGxldCBmYXVsdHNQZXJab25lOiB7W2tleTogc3RyaW5nXTogSU1ldHJpY30gPSB7fTtcblxuICAgICAgICAvLyBDb2xsZWN0IHBhY2tldCBkcm9wIG1ldHJpY3MgZm9yIGVhY2ggQVpcbiAgICAgICAgbGV0IHBhY2tldERyb3BzUGVyWm9uZToge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBBWiBtYXBwZXIgcmVzb3VyY2UgdG8gdHJhbnNsYXRlIEFaIG5hbWVzIHRvIGlkc1xuICAgICAgICBsZXQgYXpNYXBwZXI6IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXIgPSBuZXcgQXZhaWxhYmlsaXR5Wm9uZU1hcHBlcih0aGlzLCBcIkF2YWlsYWJpbGl0eVpvbmVNYXBwZXJcIik7XG5cbiAgICAgICAgLy8gU2V0dXAga2V5IHByZWZpeCBmb3IgdW5pcXVlIG1ldHJpYyBtYXRoIGV4cHJlc3Npb25zXG4gICAgICAgIGxldCBrZXlQcmVmaXg6IHN0cmluZyA9IFwiXCI7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG1ldHJpY3MgYW5kIGFsYXJtcyBmb3IganVzdCBsb2FkIGJhbGFuY2VycyBpZiB0aGV5IHdlcmUgcHJvdmlkZWRcbiAgICAgICAgaWYgKHRoaXMuYXBwbGljYXRpb25Mb2FkQmFsYW5jZXJzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcHBsaWNhdGlvbkxvYWRCYWxhbmNlcnMgIT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQ29sbGVjdCB0b3RhbCBmYXVsdCBjb3VudCBtZXRyaWNzIHBlciBBWlxuICAgICAgICAgICAgbGV0IGFsYlpvbmVGYXVsdENvdW50TWV0cmljczoge1trZXk6IHN0cmluZ106IElNZXRyaWNbXX0gPSB7fTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGZhdWx0IHJhdGUgYWxhcm1zIHBlciBBWiBpbmRpY2F0aW5nIGF0IGxlYXN0IDEgQUxCXG4gICAgICAgICAgICAvLyBpbiB0aGUgQVogc2F3IGEgZmF1bHQgcmF0ZSB0aGF0IGV4Y2VlZGVkIHRoZSB0aHJlc2hvbGRcbiAgICAgICAgICAgIGxldCBmYXVsdFJhdGVQZXJjZW50YWdlQWxhcm1zOiB7W2tleTogc3RyaW5nXTogSUFsYXJtW119ID0ge307XG5cbiAgICAgICAgICAgIC8vIEl0ZXJhdGUgZWFjaCBBTEJcbiAgICAgICAgICAgIHRoaXMuYXBwbGljYXRpb25Mb2FkQmFsYW5jZXJzLmZvckVhY2goYWxiID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgZWFjaCBBWiBpbiB0aGUgVlBDXG4gICAgICAgICAgICAgICAgYWxiLnZwYz8uYXZhaWxhYmlsaXR5Wm9uZXMuZm9yRWFjaCgoYXosIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCBuZXh0IHVuaXF1ZSBrZXlcbiAgICAgICAgICAgICAgICAgICAga2V5UHJlZml4ID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcgPSBhek1hcHBlci5hdmFpbGFiaWxpdHlab25lSWQoYXopO1xuICAgICAgICAgICAgICAgICAgICBmYXVsdFJhdGVQZXJjZW50YWdlQWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyA1eHggcmVzcG9uc2VzIGZyb20gdGFyZ2V0c1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0NXh4OiBJTWV0cmljID0gYWxiLm1ldHJpY3MuaHR0cENvZGVUYXJnZXQoSHR0cENvZGVUYXJnZXQuVEFSR0VUXzVYWF9DT1VOVCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXZhaWxhYmlsaXR5Wm9uZVwiOiBheixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkxvYWRCYWxhbmNlclwiOiAoKGFsYiBhcyBJTG9hZEJhbGFuY2VyVjIpIGFzIEJhc2VMb2FkQmFsYW5jZXIpLmxvYWRCYWxhbmNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMucGVyaW9kXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIDV4eCByZXNwb25zZXMgZnJvbSBFTEJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVsYjV4eDogSU1ldHJpYyA9IGFsYi5tZXRyaWNzLmh0dHBDb2RlRWxiKEh0dHBDb2RlRWxiLkVMQl81WFhfQ09VTlQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkF2YWlsYWJpbGl0eVpvbmVcIjogYXosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogKChhbGIgYXMgSUxvYWRCYWxhbmNlclYyKSBhcyBCYXNlTG9hZEJhbGFuY2VyKS5sb2FkQmFsYW5jZXJGdWxsTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnBlcmlvZFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyAyeHggcmVzcG9uc2VzIGZyb20gdGFyZ2V0c1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0Mnh4OiBJTWV0cmljID0gYWxiLm1ldHJpY3MuaHR0cENvZGVUYXJnZXQoSHR0cENvZGVUYXJnZXQuVEFSR0VUXzJYWF9DT1VOVCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXZhaWxhYmlsaXR5Wm9uZVwiOiBheixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkxvYWRCYWxhbmNlclwiOiAoKGFsYiBhcyBJTG9hZEJhbGFuY2VyVjIpIGFzIEJhc2VMb2FkQmFsYW5jZXIpLmxvYWRCYWxhbmNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMucGVyaW9kXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIDN4eCByZXNwb25zZXMgZnJvbSB0YXJnZXRzXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQzeHg6IElNZXRyaWMgPSBhbGIubWV0cmljcy5odHRwQ29kZVRhcmdldChIdHRwQ29kZVRhcmdldC5UQVJHRVRfM1hYX0NPVU5ULCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBdmFpbGFiaWxpdHlab25lXCI6IGF6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTG9hZEJhbGFuY2VyXCI6ICgoYWxiIGFzIElMb2FkQmFsYW5jZXJWMikgYXMgQmFzZUxvYWRCYWxhbmNlcikubG9hZEJhbGFuY2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gM3h4IHJlc3BvbmVzcyBmcm9tIEVMQlxuICAgICAgICAgICAgICAgICAgICBsZXQgZWxiM3h4OiBJTWV0cmljID0gYWxiLm1ldHJpY3MuaHR0cENvZGVFbGIoSHR0cENvZGVFbGIuRUxCXzNYWF9DT1VOVCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXZhaWxhYmlsaXR5Wm9uZVwiOiBheixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkxvYWRCYWxhbmNlclwiOiAoKGFsYiBhcyBJTG9hZEJhbGFuY2VyVjIpIGFzIEJhc2VMb2FkQmFsYW5jZXIpLmxvYWRCYWxhbmNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMucGVyaW9kXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBtZXRyaWNzIGZvciB0b3RhbCBmYXVsdCBjb3VudCBmcm9tIHRoaXMgQUxCXG4gICAgICAgICAgICAgICAgICAgIGxldCB1c2luZ01ldHJpY3M6IHtba2V5OiBzdHJpbmddOiBJTWV0cmljfSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTFgXSA9IHRhcmdldDV4eDtcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzW2Ake2tleVByZWZpeH0yYF0gPSBlbGI1eHg7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsYlpvbmVGYXVsdENvdW50TWV0cmljc1thdmFpbGFiaWxpdHlab25lSWRdID09PSB1bmRlZmluZWQgfHwgYWxiWm9uZUZhdWx0Q291bnRNZXRyaWNzW2F2YWlsYWJpbGl0eVpvbmVJZF0gPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxiWm9uZUZhdWx0Q291bnRNZXRyaWNzW2F2YWlsYWJpbGl0eVpvbmVJZF0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFsYlpvbmVGYXVsdENvdW50TWV0cmljc1thdmFpbGFiaWxpdHlab25lSWRdLnB1c2gobmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGAoJHtrZXlQcmVmaXh9MSArICR7a2V5UHJlZml4fTIpYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljczogdXNpbmdNZXRyaWNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIFwiICsgYWxiLmxvYWRCYWxhbmNlckFybiArIFwiIGZhdWx0IGNvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnBlcmlvZCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbWV0cmljcyB0byBjYWxjdWxhdGUgZmF1bHQgcmF0ZSBmb3IgdGhpcyBBTEJcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzID0ge307XG4gICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9MWBdID0gdGFyZ2V0Mnh4O1xuICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTJgXSA9IHRhcmdldDN4eDtcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzW2Ake2tleVByZWZpeH0zYF0gPSBlbGIzeHg7XG4gICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9NGBdID0gdGFyZ2V0NXh4O1xuICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTVgXSA9IGVsYjV4eDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgQUxCIGZhdWx0IHJhdGVcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZhdWx0UmF0ZTogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBgKCgke2tleVByZWZpeH00KyR7a2V5UHJlZml4fTUpLygke2tleVByZWZpeH0xKyR7a2V5UHJlZml4fTIrJHtrZXlQcmVmaXh9Myske2tleVByZWZpeH00KyR7a2V5UHJlZml4fTUpKSAqIDEwMGAsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3M6IHVzaW5nTWV0cmljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBcIiArIGFsYi5sb2FkQmFsYW5jZXJBcm4gKyBcIiBmYXVsdCByYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnBlcmlvZFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgdGhyZXNob2xkOiBudW1iZXIgPSBwcm9wcy5mYXVsdENvdW50UGVyY2VudGFnZVRocmVzaG9sZCA/PyA1O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIGZhdWx0IHJhdGUgYWxhcm0gZm9yIHRoZSBBTEJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZhdWx0UmF0ZUFsYXJtOiBJQWxhcm0gPSBuZXcgQWxhcm0odGhpcywgXCJBWlwiICsgaW5kZXggKyBrZXlQcmVmaXggKyBcIkZhdWx0UmF0ZVBlcmNlbnRhZ2VBbGFybVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiLVwiICsgYWxiLmxvYWRCYWxhbmNlckFybiArIFwiLWZhdWx0LXJhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpYzogZmF1bHRSYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocmVzaG9sZDogdGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX1RIUkVTSE9MRFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhpcyBBTEIncyBmYXVsdCByYXRlIGFsYXJtXG4gICAgICAgICAgICAgICAgICAgIGZhdWx0UmF0ZVBlcmNlbnRhZ2VBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXS5wdXNoKGZhdWx0UmF0ZUFsYXJtKTtcbiAgICAgICAgICAgICAgICB9KTsgICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSXRlcmF0ZSBBWnMgZm9yIHRoZSBBTEIgZmF1bHQgY291bnQgbWV0cmljc1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoYWxiWm9uZUZhdWx0Q291bnRNZXRyaWNzKS5mb3JFYWNoKGF2YWlsYWJpbGl0eVpvbmVJZCA9PiB7XG4gICAgICAgICAgICAgICAga2V5UHJlZml4ID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGxldCBjb3VudGVyOiBudW1iZXIgPSAxO1xuICAgICAgICAgICAgICAgIGxldCB1c2luZ01ldHJpY3M6IHtba2V5OiBzdHJpbmddOiBJTWV0cmljfSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gQWRkIGVhY2ggQUxCJ3MgZmF1bHQgY291bnQgbWV0cmljcyB0byB0aGUgZGljdGlvbmFyeVxuICAgICAgICAgICAgICAgIGFsYlpvbmVGYXVsdENvdW50TWV0cmljc1thdmFpbGFiaWxpdHlab25lSWRdLmZvckVhY2gobWV0cmljID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzW2Ake2tleVByZWZpeH0ke2NvdW50ZXIrK31gXSA9IG1ldHJpYztcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFN1bSB0aGUgdG90YWwgZmF1bHRzIGZvciB0aGUgYXZhaWxhYmlsaXR5IHpvbmUgYWNyb3NzIGFsbCBBTEJzXG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsRmF1bHRzUGVyWm9uZTogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IE9iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIiksXG4gICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljczogdXNpbmdNZXRyaWNzLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgZmF1bHQgY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGtleVByZWZpeCA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKGtleVByZWZpeCk7XG4gICAgICAgICAgICAgICAgY291bnRlciA9IDE7XG5cbiAgICAgICAgICAgICAgICAvLyBBc3NpZ24gdGhlIHRvdGFsIGZhdWx0cyBwZXIgem9uZSB0byB0aGUgZGljdGlvbmFyeVxuICAgICAgICAgICAgICAgIGZhdWx0c1BlclpvbmVbYXZhaWxhYmlsaXR5Wm9uZUlkXSA9IHRvdGFsRmF1bHRzUGVyWm9uZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihrZXlQcmVmaXgpO1xuXG4gICAgICAgICAgICBsZXQgdG1wOiB7W2tleTogc3RyaW5nXTogSU1ldHJpY30gPSB7fTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGZhdWx0c1BlclpvbmUpLmZvckVhY2goKGF2YWlsYWJpbGl0eVpvbmVJZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICB0bXBbYCR7a2V5UHJlZml4fSR7aW5kZXh9YF0gPSBmYXVsdHNQZXJab25lW2F2YWlsYWJpbGl0eVpvbmVJZF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSB0b3RhbCBmYXVsdHMgaW4gdGhlIHJlZ2lvbiBieSBhZGRpbmcgYWxsIEFacyB0b2dldGhlclxuICAgICAgICAgICAgbGV0IHRvdGFsRmF1bHRzOiBJTWV0cmljID0gbmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBPYmplY3Qua2V5cyh0bXApLmpvaW4oXCIrXCIpLFxuICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljczogdG1wLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiIGZhdWx0IGNvdW50XCIsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBGaW5hbGx5LCBpdGVyYXRlIGJhY2sgdGhyb3VnaCBlYWNoIEFaXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhmYXVsdHNQZXJab25lKS5mb3JFYWNoKChhdmFpbGFiaWxpdHlab25lSWQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAga2V5UHJlZml4ID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4KTtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgaWYgQVogaXMgYW4gb3V0bGllciBmb3IgZmF1bHRzIGJ5IGV4Y2VlZGluZ1xuICAgICAgICAgICAgICAgIC8vIGEgc3RhdGljIHRocmVzaG9sZCBcbiAgICAgICAgICAgICAgICBsZXQgYXpJc091dGxpZXJGb3JGYXVsdHM6IElBbGFybTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvcHMub3V0bGllckRldGVjdGlvbkFsZ29yaXRobSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgT3V0bGllckRldGVjdGlvbkFsZ29yaXRobS5TVEFUSUM6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBtZXRyaWNzIHdpbGwgZ2l2ZSB0aGUgcGVyY2VudCBvZiBmYXVsdHMgZm9yIHRoZSBBWlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVzaW5nTWV0cmljczoge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTFgXSA9IGZhdWx0c1BlclpvbmVbYXZhaWxhYmlsaXR5Wm9uZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9MmBdID0gdG90YWxGYXVsdHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF6SXNPdXRsaWVyRm9yRmF1bHRzID0gbmV3IEFsYXJtKHRoaXMsIFwiQVpcIiArIGluZGV4ICsgXCJGYXVsdENvdW50T3V0bGllckFsYXJtXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiLWZhdWx0LWNvdW50LW91dGxpZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWM6IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGAke2tleVByZWZpeH0xIC8gJHtrZXlQcmVmaXh9MmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljczogdXNpbmdNZXRyaWNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyZXNob2xkOiBwcm9wcy5vdXRsaWVyVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLklHTk9SRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBpc29sYXRlZCBBWiBpbXBhY3QgYWxhcm1zIGJ5IGRldGVybWluaW5nXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIEFaIGlzIGFuIG91dGxpZXIgZm9yIGZhdWx0IGNvdW50IGFuZCBhdCBsZWFzdFxuICAgICAgICAgICAgICAgIC8vIG9uZSBBTEIgZXhjZWVkcyB0aGUgZmF1bHQgcmF0ZSB0aHJlc2hvbGQgcHJvdmlkZWRcbiAgICAgICAgICAgICAgICB0aGlzLmFsYlpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXSA9IG5ldyBDb21wb3NpdGVBbGFybSh0aGlzLCBcIkFaXCIgKyBpbmRleCArIFwiSXNvbGF0ZWRGYXVsdENvdW50SW1wYWN0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlQWxhcm1OYW1lOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIi1pc29sYXRlZC1mYXVsdC1jb3VudC1pbXBhY3RcIixcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1SdWxlOiBBbGFybVJ1bGUuYWxsT2YoXG4gICAgICAgICAgICAgICAgICAgICAgICBheklzT3V0bGllckZvckZhdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEFsYXJtUnVsZS5hbnlPZihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5mYXVsdFJhdGVQZXJjZW50YWdlQWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihcIlwiKTtcblxuICAgICAgICAvLyBDcmVhdGUgTkFUIEdhdGV3YXkgbWV0cmljcyBhbmQgYWxhcm1zXG4gICAgICAgIGlmICh0aGlzLm5hdEdhdGV3YXlzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5uYXRHYXRld2F5cyAhPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBDb2xsZWN0IGFsYXJtcyBmb3IgcGFja2V0IGRyb3BzIGV4Y2VlZGluZyBhIHRocmVzaG9sZCBwZXIgTkFUIEdXXG4gICAgICAgICAgICBsZXQgcGFja2V0RHJvcFBlcmNlbnRhZ2VBbGFybXM6IHtba2V5OiBzdHJpbmddOiBJQWxhcm1bXX0gPSB7fTtcblxuICAgICAgICAgICAgLy8gRm9yIGVhY2ggQVosIGNyZWF0ZSBtZXRyaWNzIGZvciBlYWNoIE5BVCBHV1xuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5uYXRHYXRld2F5cykuZm9yRWFjaCgoZW50cnksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBwYWNrZXQgZHJvcHMgZm9yIGVhY2ggTkFUIEdXIGluIHRoZSBBWlxuICAgICAgICAgICAgICAgIGxldCBwYWNrZXREcm9wTWV0cmljc0ZvckFaOiB7W2tleTogc3RyaW5nXTogSU1ldHJpY30gPSB7fTtcbiAgICAgICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkID0gYXpNYXBwZXIuYXZhaWxhYmlsaXR5Wm9uZUlkKGVudHJ5WzBdKTtcbiAgICAgICAgICAgICAgICBwYWNrZXREcm9wUGVyY2VudGFnZUFsYXJtc1thdmFpbGFiaWxpdHlab25lSWRdID0gW107XG5cbiAgICAgICAgICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBOQVQgR1cgaW4gdGhlIGN1cnJlbnQgQVogXG4gICAgICAgICAgICAgICAgZW50cnlbMV0uZm9yRWFjaChuYXRndyA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHBhY2tldCBkcm9wc1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2V0RHJvcENvdW50OiBJTWV0cmljID0gbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNOYW1lOiBcIlBhY2tldHNEcm9wQ291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogXCJBV1MvTkFUR2F0ZXdheVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogVW5pdC5DT1VOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBwYWNrZXQgZHJvcHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5hdEdhdGV3YXlJZFwiOiBuYXRndy5hdHRyTmF0R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHBhY2tldHMgaW4gZnJvbSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY2tldHNJbkZyb21Tb3VyY2VDb3VudDogSU1ldHJpYyA9IG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljTmFtZTogXCJQYWNrZXRzSW5Gcm9tU291cmNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL05BVEdhdGV3YXlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgcGFja2V0cyBpbiBmcm9tIHNvdXJjZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTmF0R2F0ZXdheUlkXCI6IG5hdGd3LmF0dHJOYXRHYXRld2F5SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnBlcmlvZFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgcGFja2V0cyBpbiBmcm9tIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWNrZXRzSW5Gcm9tRGVzdGluYXRpb25Db3VudDogSU1ldHJpYyA9IG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljTmFtZTogXCJQYWNrZXRzSW5Gcm9tRGVzdGluYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogXCJBV1MvTkFUR2F0ZXdheVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogVW5pdC5DT1VOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBwYWNrZXRzIGluIGZyb20gZGVzdGluYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5hdEdhdGV3YXlJZFwiOiBuYXRndy5hdHRyTmF0R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHVzaW5nTWV0cmljczoge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG4gICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9MWBdID0gcGFja2V0RHJvcENvdW50O1xuICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTJgXSA9IHBhY2tldHNJbkZyb21Tb3VyY2VDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzW2Ake2tleVByZWZpeH0zYF0gPSBwYWNrZXRzSW5Gcm9tRGVzdGluYXRpb25Db3VudDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgYSBwZXJjZW50YWdlIG9mIGRyb3BwZWQgcGFja2V0cyBmb3IgdGhlIE5BVCBHV1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2V0RHJvcFBlcmNlbnRhZ2U6IElNZXRyaWMgPSBuZXcgTWF0aEV4cHJlc3Npb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogYCgke2tleVByZWZpeH0xIC8gKCR7a2V5UHJlZml4fTIgKyAke2tleVByZWZpeH0zKSkgKiAxMDBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB1c2luZ01ldHJpY3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgcGFja2V0IGRyb3AgcGVyY2VudGFnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRocmVzaG9sZDogbnVtYmVyID0gcHJvcHMucGFja2V0TG9zc0ltcGFjdFBlcmNlbnRhZ2VUaHJlc2hvbGQgPz8gMC4wMTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gYWxhcm0gZm9yIHRoaXMgTkFUIEdXIGlmIHBhY2tldCBkcm9wcyBleGNlZWQgdGhlIHNwZWNpZmllZCB0aHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhY2tldERyb3BJbXBhY3RBbGFybTogSUFsYXJtID0gbmV3IEFsYXJtKHRoaXMsIFwiQVpcIiArIChpbmRleCArIDEpICsgXCJQYWNrZXREcm9wSW1wYWN0QWxhcm1cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxhcm1OYW1lOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIi1cIiArIG5hdGd3LmF0dHJOYXRHYXRld2F5SWQgKyBcIi1wYWNrZXQtZHJvcC1pbXBhY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpYzogcGFja2V0RHJvcFBlcmNlbnRhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJlc2hvbGQ6IHRocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLkdSRUFURVJfVEhBTl9USFJFU0hPTEQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiAzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbGxlY3QgYWxsIG9mIHRoZSBwYWNrZXQgZHJvcCBpbXBhY3QgYWxhcm1zIGZvciBlYWNoXG4gICAgICAgICAgICAgICAgICAgIC8vIE5BVCBHVyBpbiB0aGlzIEFaLCBuZWVkIHRvIGtub3cgYXQgbGVhc3QgMSBzZWVzIHN1YnN0YW50aWFsXG4gICAgICAgICAgICAgICAgICAgIC8vIGVub3VnaCBpbXBhY3QgdG8gY29uc2lkZXIgdGhlIEFaIGFzIGltcGFpcmVkXG4gICAgICAgICAgICAgICAgICAgIHBhY2tldERyb3BQZXJjZW50YWdlQWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0ucHVzaChwYWNrZXREcm9wSW1wYWN0QWxhcm0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbGxlY3QgdGhlIHBhY2tldCBkcm9wIG1ldHJpY3MgZm9yIHRoaXMgQVogc28gd2UgY2FuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGVtIGFsbCB0b2dldGhlciBhbmQgY291bnQgdG90YWwgcGFja2V0IGRyb3BzXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBhbGwgTkFUIEdXcyBpbiB0aGUgQVpcbiAgICAgICAgICAgICAgICAgICAgcGFja2V0RHJvcE1ldHJpY3NGb3JBWltgbSR7aW5kZXh9YF0gPSBwYWNrZXREcm9wQ291bnQ7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtZXRyaWMgdGhhdCBhZGRzIHVwIGFsbCBwYWNrZXRzIGRyb3BzIGZyb20gZWFjaFxuICAgICAgICAgICAgICAgIC8vIE5BVCBHVyBpbiB0aGUgQVpcbiAgICAgICAgICAgICAgICBsZXQgcGFja2V0RHJvcHNJblRoaXNBWjogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IE9iamVjdC5rZXlzKHBhY2tldERyb3BNZXRyaWNzRm9yQVopLmpvaW4oXCIrXCIpLFxuICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3M6IHBhY2tldERyb3BNZXRyaWNzRm9yQVosXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBkcm9wcGVkIHBhY2tldHNcIixcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2RcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFJlY29yZCB0aGVzZSBzbyB3ZSBjYW4gYWRkIHRoZW0gdXBcbiAgICAgICAgICAgICAgICAvLyBhbmQgZ2V0IGEgdG90YWwgYW1vdW50IG9mIHBhY2tldCBkcm9wc1xuICAgICAgICAgICAgICAgIC8vIGluIHRoZSByZWdpb24gYWNyb3NzIGFsbCBBWnNcbiAgICAgICAgICAgICAgICBwYWNrZXREcm9wc1BlclpvbmVbYXZhaWxhYmlsaXR5Wm9uZUlkXSA9IHBhY2tldERyb3BzSW5UaGlzQVo7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAga2V5UHJlZml4ID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4KTtcblxuICAgICAgICAgICAgbGV0IHRtcDoge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWNrZXREcm9wc1BlclpvbmUpLmZvckVhY2goKGF2YWlsYWJpbGl0eVpvbmVJZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICB0bXBbYCR7a2V5UHJlZml4fSR7aW5kZXh9YF0gPSBwYWNrZXREcm9wc1BlclpvbmVbYXZhaWxhYmlsaXR5Wm9uZUlkXTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdG90YWwgcGFja2V0IGRyb3BzIGZvciB0aGUgcmVnaW9uXG4gICAgICAgICAgICBsZXQgdG90YWxQYWNrZXREcm9wczogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogT2JqZWN0LmtleXModG1wKS5qb2luKFwiK1wiKSxcbiAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3M6IHRtcCxcbiAgICAgICAgICAgICAgICBsYWJlbDogRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcIiBkcm9wcGVkIHBhY2tldHNcIixcbiAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnBlcmlvZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBvdXRsaWVyIGRldGVjdGlvbiBhbGFybXMgYnkgY29tcGFyaW5nIHBhY2tldFxuICAgICAgICAgICAgLy8gZHJvcHMgaW4gb25lIEFaIHZlcnN1cyB0b3RhbCBwYWNrZXQgZHJvcHMgaW4gdGhlIHJlZ2lvblxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFja2V0RHJvcHNQZXJab25lKS5mb3JFYWNoKChhdmFpbGFiaWxpdHlab25lSWQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGF6SXNPdXRsaWVyRm9yUGFja2V0RHJvcHM6IElBbGFybTtcbiAgICAgICAgICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihrZXlQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wcy5vdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBPdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtLlNUQVRJQzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1c2luZ01ldHJpY3M6IHtba2V5OiBzdHJpbmddOiBJTWV0cmljIH0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9MWBdID0gcGFja2V0RHJvcHNQZXJab25lW2F2YWlsYWJpbGl0eVpvbmVJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fTJgXSA9IHRvdGFsUGFja2V0RHJvcHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF6SXNPdXRsaWVyRm9yUGFja2V0RHJvcHMgPSBuZXcgQWxhcm0odGhpcywgXCJBWlwiICsgaW5kZXggKyBcIk5BVEdXRHJvcHBlZFBhY2tldHNPdXRsaWVyQWxhcm1cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpYzogbmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogYCgke2tleVByZWZpeH0xIC8gJHtrZXlQcmVmaXh9MikgKiAxMDBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3M6IHVzaW5nTWV0cmljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIHBlcmNlbnRhZ2Ugb2YgZHJvcHBlZCBwYWNrZXRzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiLWRyb3BwZWQtcGFja2V0cy1vdXRsaWVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyZXNob2xkOiBwcm9wcy5vdXRsaWVyVGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSW4gYWRkaXRpb24gdG8gYmVpbmcgYW4gb3V0bGllciBmb3IgcGFja2V0IGRyb3BzLCBtYWtlIHN1cmVcbiAgICAgICAgICAgICAgICAvLyB0aGUgcGFja2V0IGxvc3MgaXMgc3Vic3RhbnRpYWwgZW5vdWdoIHRvIHRyaWdnZXIgdGhlIGFsYXJtXG4gICAgICAgICAgICAgICAgLy8gYnkgbWFraW5nIHN1cmUgYXQgbGVhc3QgMSBOQVQgR1cgc2VlcyBwYWNrZXQgbG9zcyBtb3JlIHRoYW4gMC4wMSVcbiAgICAgICAgICAgICAgICBsZXQgYXpJc091dGxpZXJBbmRTZWVzSW1wYWN0OiBJQWxhcm0gPSBuZXcgQ29tcG9zaXRlQWxhcm0odGhpcywgXCJBWlwiICsgaW5kZXggKyBcIk5BVEdXSXNvbGF0ZWRJbXBhY3RcIiwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiLWlzb2xhdGVkLW5hdGd3LWltcGFjdFwiLFxuICAgICAgICAgICAgICAgICAgICBhbGFybVJ1bGU6IEFsYXJtUnVsZS5hbGxPZihcbiAgICAgICAgICAgICAgICAgICAgICAgIGF6SXNPdXRsaWVyRm9yUGFja2V0RHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBBbGFybVJ1bGUuYW55T2YoLi4ucGFja2V0RHJvcFBlcmNlbnRhZ2VBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHRoZXNlIHNvIHRoZXkgY2FuIGJlIHVzZWQgaW4gZGFzaGJvYXJkIG9yIGZvciBjb21iaW5hdGlvblxuICAgICAgICAgICAgICAgIC8vIHdpdGggQVpcbiAgICAgICAgICAgICAgICB0aGlzLm5hdEdXWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtc1thdmFpbGFiaWxpdHlab25lSWRdID0gYXpJc091dGxpZXJBbmRTZWVzSW1wYWN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHbyB0aHJvdWdoIHRoZSBBTEIgem9uYWwgaXNvbGF0ZWQgaW1wYWN0IGFsYXJtcyBhbmQgc2VlIGlmIHRoZXJlIGlzIGEgTkFUIEdXXG4gICAgICAgIC8vIGlzb2xhdGVkIGltcGFjdCBhbGFybSBmb3IgdGhlIHNhbWUgQVogSUQsIGlmIHNvLCBjcmVhdGUgYSBjb21wb3NpdGUgYWxhcm0gd2l0aCBib3RoXG4gICAgICAgIC8vIG90aGVyd2lzZSBjcmVhdGUgYSBjb21wb3NpdGUgYWxhcm0gd2l0aCBqdXN0IHRoZSBBTEJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5hbGJab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zKS5mb3JFYWNoKChhdmFpbGFiaWxpdHlab25lSWQsIGluZGV4KSA9PiB7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHRtcDogSUFsYXJtW10gPSBbXTtcbiAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMuYWxiWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtc1thdmFpbGFiaWxpdHlab25lSWRdKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm5hdEdXWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtc1thdmFpbGFiaWxpdHlab25lSWRdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5uYXRHV1pvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXSAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMubmF0R1dab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0gPSBuZXcgQ29tcG9zaXRlQWxhcm0odGhpcywgXCJBWlwiICsgaW5kZXggKyBcIkFnZ3JlZ2F0ZUlzb2xhdGVkSW1wYWN0QWxhcm1cIiwge1xuICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUFsYXJtTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCItYWdncmVnYXRlLWlzb2xhdGVkLWltcGFjdFwiLFxuICAgICAgICAgICAgICAgIGFsYXJtUnVsZTogQWxhcm1SdWxlLmFueU9mKC4uLnRtcCksXG4gICAgICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSB0aGVyZSB3ZXJlIEFacyB3aXRoIG9ubHkgYSBOQVQgR1cgYW5kIG5vIEFMQiwgY3JlYXRlIGEgY29tcG9zaXRlIGFsYXJtXG4gICAgICAgIC8vIGZvciB0aGUgTkFUIEdXIG1ldHJpY3NcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5uYXRHV1pvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXMpLmZvckVhY2goKGF2YWlsYWJpbGl0eVpvbmVJZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IHlldCBoYXZlIGFuIGlzb2xhdGVkIGltcGFjdCBhbGFybSBmb3IgdGhpcyBBWiwgcHJvY2VlZFxuICAgICAgICAgICAgaWYgKHRoaXMuYWdncmVnYXRlWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtc1thdmFpbGFiaWxpdHlab25lSWRdID09PSB1bmRlZmluZWQgfHwgdGhpcy5hZ2dyZWdhdGVab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0gPT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsZXQgdG1wOiBJQWxhcm1bXSA9IFtdO1xuICAgICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMubmF0R1dab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFsYlpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYWxiWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtcyAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2godGhpcy5hbGJab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zW2F2YWlsYWJpbGl0eVpvbmVJZF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmFnZ3JlZ2F0ZVpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXNbYXZhaWxhYmlsaXR5Wm9uZUlkXSA9IG5ldyBDb21wb3NpdGVBbGFybSh0aGlzLCBcIkFaXCIgKyBpbmRleCArIFwiQWdncmVnYXRlSXNvbGF0ZWRJbXBhY3RBbGFybVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZUFsYXJtTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCItYWdncmVnYXRlLWlzb2xhdGVkLWltcGFjdFwiLFxuICAgICAgICAgICAgICAgICAgICBhbGFybVJ1bGU6IEFsYXJtUnVsZS5hbnlPZiguLi50bXApLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zRW5hYmxlZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLmNyZWF0ZURhc2hib2FyZCA9PSB0cnVlKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmRhc2hib2FyZCA9IG5ldyBCYXNpY1NlcnZpY2VEYXNoYm9hcmQodGhpcywgXCJCYXNpY1NlcnZpY2VEYXNoYm9hcmRcIiwge1xuICAgICAgICAgICAgICAgIHNlcnZpY2VOYW1lOiBwcm9wcy5zZXJ2aWNlTmFtZSArIEZuLnN1YihcIi1hdmFpbGFiaWxpdHktJHtBV1M6OlJlZ2lvblwiKSxcbiAgICAgICAgICAgICAgICB6b25hbEFnZ3JlZ2F0ZUlzb2xhdGVkSW1wYWN0QWxhcm1zOiB0aGlzLmFnZ3JlZ2F0ZVpvbmFsSXNvbGF0ZWRJbXBhY3RBbGFybXMsXG4gICAgICAgICAgICAgICAgem9uYWxMb2FkQmFsYW5jZXJJc29sYXRlZEltcGFjdEFsYXJtczogdGhpcy5hbGJab25hbElzb2xhdGVkSW1wYWN0QWxhcm1zLFxuICAgICAgICAgICAgICAgIHpvbmFsTmF0R2F0ZXdheUlzb2xhdGVkSW1wYWN0QWxhcm1zOiB0aGlzLm5hdEdXWm9uYWxJc29sYXRlZEltcGFjdEFsYXJtcyxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogcHJvcHMuaW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgem9uYWxMb2FkQmFsYW5jZXJGYXVsdFJhdGVNZXRyaWNzOiBmYXVsdHNQZXJab25lLFxuICAgICAgICAgICAgICAgIHpvbmFsTmF0R2F0ZXdheVBhY2tldERyb3BNZXRyaWNzOiBwYWNrZXREcm9wc1BlclpvbmVcbiAgICAgICAgICAgIH0pLmRhc2hib2FyZDtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=