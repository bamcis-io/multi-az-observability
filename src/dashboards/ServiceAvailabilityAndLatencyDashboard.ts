import { Construct } from "constructs";
import { IServiceAvailabilityAndLatencyDashboardProps } from "./props/IServiceAvailabilityAndLatencyDashboardProps";
import { AlarmStatusWidget, Color, Dashboard, GraphWidget, IMetric, IWidget, MathExpression, PeriodOverride, TextWidget } from "aws-cdk-lib/aws-cloudwatch";
import { ZonalAvailabilityMetricProps } from "../metrics/props/ZonalAvailabilityMetricProps";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { Fn } from "aws-cdk-lib";
import { ServiceAvailabilityMetricProps } from "../metrics/props/ServiceAvailabilityMetricProps";
import { IServiceAvailabilityMetricProps } from "../metrics/props/IServiceAvailabilityMetricProps";
import { RegionalAvailabilityMetricProps } from "../metrics/props/RegionalAvailabilityMetricProps";
import { IRegionalAvailabilityMetricProps } from "../metrics/props/IRegionalAvailabilityMetricProps";
import { IZonalAvailabilityMetricProps } from "../metrics/props/IZonalAvailabilityMetricProps";
import { IServiceAvailabilityAndLatencyDashboard } from "./IServiceAvailabilityAndLatencyDashboard";

/**
 * Creates a service level availability and latency dashboard
 */
export class ServiceAvailabilityAndLatencyDashboard extends Construct implements IServiceAvailabilityAndLatencyDashboard
{
    /**
     * The service level dashboard
     */
    dashboard: Dashboard;

    constructor(scope: Construct, id: string, props: IServiceAvailabilityAndLatencyDashboardProps)
    {
        super(scope, id);

        let topLevelAggregateAlarmWidgets: IWidget[] = [];

        topLevelAggregateAlarmWidgets.push(new TextWidget({
            height: 2,
            width: 24,
            markdown: "***Availability and Latency Alarms***"
        }));

        topLevelAggregateAlarmWidgets.push(new AlarmStatusWidget({
            height: 2,
            width: 24,
            alarms: [
                props.aggregateRegionalAlarm
            ],
            title: "Customer Experience - Regional Aggregate Impact Alarm (measures fault count in aggregate across all critical operations)"
        }));

        let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar("");
        let perOperationAZFaultsMetrics: IMetric[] = [];

        for (let i = 0; i < props.service.azCount; i++)
        {
            let counter: number = 1;
            let availabilityZoneId: string = props.service.GetAvailabilityZoneIdAtIndex(i);

            topLevelAggregateAlarmWidgets.push(new AlarmStatusWidget({
                height: 2,
                width: 8,
                alarms: [
                    props.zonalAggregateAlarms[i]
                ],
                title: availabilityZoneId + " Zonal Isolated Impact Alarm (any critical operation in this AZ shows impact from server-side or canary)"
            }))

            let usingMetrics: {[key: string]: IMetric} = {};

            props.service.criticalOperations.forEach(x => {
                let zonalMetricProps = new ZonalAvailabilityMetricProps();
                zonalMetricProps.availabilityZoneId = availabilityZoneId;
                zonalMetricProps.metricDetails = x.serverSideAvailabilityMetricDetails;
                zonalMetricProps.label = availabilityZoneId + " " + x.operationName + " fault count";
                zonalMetricProps.metricType = AvailabilityMetricType.FAULT_COUNT;
                zonalMetricProps.keyPrefix = keyPrefix;
                
                usingMetrics[`${keyPrefix}${counter++}`] = AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric(zonalMetricProps);
            });

            let zonalFaultCount: IMetric = new MathExpression({
                expression: Object.keys(usingMetrics).join("+"),
                label: availabilityZoneId + " fault count",
                usingMetrics: usingMetrics
            });

            perOperationAZFaultsMetrics.push(zonalFaultCount);
            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
        }

        let azContributorWidgets: IWidget[] = [
            new TextWidget({ height: 2, width: 24, markdown: "**AZ Contributors To Faults**"}),
            new GraphWidget({
                height: 6,
                width: 24,
                title: "AZ Fault Count",
                period: props.service.period,
                left: perOperationAZFaultsMetrics
            })
        ]

        topLevelAggregateAlarmWidgets.concat(ServiceAvailabilityAndLatencyDashboard.generateTPSWidgets(props));

        this.dashboard = new Dashboard(this, "TopLevelDashboard", {
            dashboardName: props.service.serviceName.toLowerCase() + Fn.sub("-service-availability-and-latency-${AWS::Region}"),
            defaultInterval: props.interval,
            periodOverride: PeriodOverride.INHERIT,
            widgets: [
                topLevelAggregateAlarmWidgets,
                azContributorWidgets,
                ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryAvailabilityWidgets(props)
            ]
        });
    }

    private static generateTPSWidgets(props: IServiceAvailabilityAndLatencyDashboardProps) : IWidget[]
    {
        let widgets: IWidget[] = [];

        widgets.push(new TextWidget({height: 2, width: 24, markdown: "**TPS Metrics**" }));

        let metricProps: IServiceAvailabilityMetricProps = new ServiceAvailabilityMetricProps();
        metricProps.label = Fn.ref("AWS::Region") + " tps";
        metricProps.period = props.service.period;
        metricProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
            let prop: IRegionalAvailabilityMetricProps = new RegionalAvailabilityMetricProps();
            prop.label = x.operationName,
            prop.metricDetails = x.serverSideAvailabilityMetricDetails,
            prop.metricType = AvailabilityMetricType.REQUEST_COUNT

            return prop;
        });
        
        widgets.push(new GraphWidget({
            height: 6,
            width: 24,
            title: Fn.ref("AWS::Region") + " TPS",
            region: Fn.ref("AWS::Region"),
            left: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics(metricProps),
            statistic: "Sum",
            leftYAxis: {
                label: "TPS",
                showUnits: false
            }
        }));

        for (let i = 0; i < props.service.azCount; i++)
        {
            let availabilityZoneId: string = props.service.GetAvailabilityZoneIdAtIndex(i);
            let zonalMetricProps = new ServiceAvailabilityMetricProps();
            zonalMetricProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
                let tmp = new ZonalAvailabilityMetricProps();
                tmp.availabilityZoneId = availabilityZoneId;
                tmp.label = x.operationName;
                tmp.metricDetails = x.serverSideAvailabilityMetricDetails;
                tmp.metricType = AvailabilityMetricType.REQUEST_COUNT;

                return tmp;
            });
            zonalMetricProps.period = props.service.period;
            zonalMetricProps.label = availabilityZoneId + "tps";
                

            widgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " TPS",
                region: Fn.ref("AWS::Region"),
                left: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics(zonalMetricProps),
                statistic: "Sum",
                leftYAxis: {
                    label: "TPS",
                    showUnits: false
                }
             }));
        }
        
        return widgets;
    }

    private static generateServerSideAndCanaryAvailabilityWidgets(props: IServiceAvailabilityAndLatencyDashboardProps): IWidget[]
    {
       let widgets: IWidget[] = [];
            
       widgets.push(new TextWidget({ height: 2, width: 24, markdown: "**Server-side Availability**\n(Each operation is equally weighted regardless of request volume)" }));
    
        widgets = widgets.concat(ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, false));
        widgets.push(new TextWidget({ height: 2, width: 24, markdown: "**Canary Measured Availability**\n(Each operation is equally weighted regardless of request volume)" }));
        widgets = widgets.concat(ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, true));

        return widgets;
    }

    private static generateAvailabilityWidgets(props: IServiceAvailabilityAndLatencyDashboardProps, isCanary: boolean) : IWidget[]
    {
        let widgets: IWidget[] = [];

        let regionalSuccessMetricProps: IServiceAvailabilityMetricProps = new ServiceAvailabilityMetricProps();
        regionalSuccessMetricProps.label = Fn.ref("AWS::Region") + " availability",
        regionalSuccessMetricProps.period = props.service.period,
        regionalSuccessMetricProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
            let tmp: IRegionalAvailabilityMetricProps = new RegionalAvailabilityMetricProps();
            tmp.label = x.operationName + " availability";
            tmp.metricDetails = isCanary ? x.canaryAvailabilityMetricDetails : x.serverSideAvailabilityMetricDetails;
            tmp.metricType = AvailabilityMetricType.SUCCESS_RATE;

            return tmp;
        });

        let regionalFaultMetricProps: IServiceAvailabilityMetricProps = new ServiceAvailabilityMetricProps();
        regionalFaultMetricProps.label = Fn.ref("AWS::Region") + " faults",
        regionalFaultMetricProps.period = props.service.period,
        regionalFaultMetricProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
            let tmp: IRegionalAvailabilityMetricProps = new RegionalAvailabilityMetricProps();
            tmp.label = x.operationName + " faults";
            tmp.metricDetails = isCanary ? x.canaryAvailabilityMetricDetails : x.serverSideAvailabilityMetricDetails;
            tmp.metricType = AvailabilityMetricType.FAULT_COUNT;

            return tmp;
        });

        widgets.push(new GraphWidget({
            height: 6,
            width: 24,
            title: Fn.ref("AWS::Region") + " Availability",
            region: Fn.ref("AWS::Region"),
            left: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics(regionalSuccessMetricProps),
            statistic: "Sum",
            leftYAxis: {
                max: 100,
                min: 95,
                label: "Availability",
                showUnits: false
            },
            right: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics(regionalFaultMetricProps),
            rightYAxis: {
                label: "Faults",
                showUnits: false,
                min: 0,
                max: Math.ceil(props.service.faultCountThreshold * 1.5)
            },
            rightAnnotations: [ 
                {
                    color: Color.RED,
                    label: "High severity",
                    value: props.service.faultCountThreshold
                }
            ]
        }));

        for (let i = 0; i < props.service.azCount; i++)
        {
            let availabilityZoneId = props.service.GetAvailabilityZoneIdAtIndex(i);

            let zonalProps: IServiceAvailabilityMetricProps = new ServiceAvailabilityMetricProps();
            zonalProps.label = availabilityZoneId + " availability";
            zonalProps.period = props.service.period;
            zonalProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
                let tmp: IZonalAvailabilityMetricProps = new ZonalAvailabilityMetricProps();
                tmp.label = x.operationName + " availability";
                tmp.availabilityZoneId = availabilityZoneId;
                tmp.metricDetails = isCanary ? x.canaryAvailabilityMetricDetails : x.serverSideAvailabilityMetricDetails;
                tmp.metricType = AvailabilityMetricType.SUCCESS_RATE;

                return tmp;
            });

            let zonalFaultMetricProps: IServiceAvailabilityMetricProps = new ServiceAvailabilityMetricProps();
            zonalFaultMetricProps.label = availabilityZoneId + " faults",
            zonalFaultMetricProps.period = props.service.period,
            zonalFaultMetricProps.availabilityMetricProps = props.service.criticalOperations.map(x => {
                let tmp: IZonalAvailabilityMetricProps = new ZonalAvailabilityMetricProps();
                tmp.label = x.operationName + " faults",
                tmp.availabilityZoneId = availabilityZoneId,
                tmp.metricDetails = isCanary ? x.canaryAvailabilityMetricDetails : x.serverSideAvailabilityMetricDetails,
                tmp.metricType = AvailabilityMetricType.FAULT_COUNT

                return tmp;
            });

            widgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Availability",
                region: Fn.ref("AWS::Region"),
                left: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics(zonalProps),
                statistic: "Sum",
                leftYAxis: {
                    max: 100,
                    min: 95,
                    label: "Availability",
                    showUnits: false
                },
                right: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics(zonalFaultMetricProps),
                rightYAxis: {
                    label: "Faults",
                    showUnits: false,
                    min: 0,
                    max: Math.ceil(props.service.faultCountThreshold * 1.5)
                },
                rightAnnotations: [
                    {
                        color: Color.RED,
                        label: "High severity",
                        value: props.service.faultCountThreshold
                    }
                ]
            })); 
        }
            
        return widgets;
    }
}