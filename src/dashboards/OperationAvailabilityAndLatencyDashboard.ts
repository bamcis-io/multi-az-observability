import { Construct } from "constructs";
import { IOperationAvailabilityAndLatencyDashboardProps } from "./props/IOperationAvailabilityAndLatencyDashboardProps";
import { Dashboard, IMetric, PeriodOverride, IWidget, TextWidget, AlarmWidget, AlarmStatusWidget, GraphWidget, Color, LegendPosition} from "aws-cdk-lib/aws-cloudwatch";
import { Fn } from "aws-cdk-lib";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { LatencyMetricType } from "../utilities/LatencyMetricType";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { IOperationAvailabilityAndLatencyWidgetProps } from "./props/IOperationAvailabilityAndLatencyWidgetProps";
import { ContributorInsightsWidget } from "./ContributorInsightsWidget";
import { OperationAvailabilityAndLatencyWidgetProps } from "./props/OperationAvailabilityAndLatencyWidgetProps";
import { BaseLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IOperationAvailabilityAndLatencyDashboard } from "./IOperationAvailabilityAndLatencyDashboard";

/**
 * Creates an operation level availability and latency dashboard
 */
export class OperationAvailabilityAndLatencyDashboard extends Construct implements IOperationAvailabilityAndLatencyDashboard
{
    /**
     * The operation level dashboard
     */
    dashboard: Dashboard;

    constructor(scope: Construct, id: string, props: IOperationAvailabilityAndLatencyDashboardProps)
    {
        super(scope, id);

        this.dashboard = new Dashboard(this, props.operation.operationName + "dashboard", {
            dashboardName: props.operation.operationName.toLowerCase() + Fn.sub("-operation-availability-and-latency-${AWS::Region}"),
            defaultInterval: props.interval,
            periodOverride: PeriodOverride.INHERIT,
            widgets: [ 
                OperationAvailabilityAndLatencyDashboard.createTopLevelAggregateAlarmWidgets(props, "**Top Level Aggregate Alarms**"),
                OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(new OperationAvailabilityAndLatencyWidgetProps(props, false), "**Server-side Availability**"),
                OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(new OperationAvailabilityAndLatencyWidgetProps(props, false), "**Server-side Latency**"),
                OperationAvailabilityAndLatencyDashboard.createApplicationLoadBalancerWidgets(props, "**Application Load Balancer Metrics**"),
                OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(new OperationAvailabilityAndLatencyWidgetProps(props, true), "**Canary Measured Availability**"),
                OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(new OperationAvailabilityAndLatencyWidgetProps(props, true), "**Canary Measured Latency**")
            ]
        });
    }

    private static createTopLevelAggregateAlarmWidgets(props: IOperationAvailabilityAndLatencyDashboardProps, title: string)
    {
        let topLevelAggregateAlarms: IWidget[] = [
            new TextWidget({ height: 2, width: 24, markdown: title }),
            new AlarmStatusWidget(
                { 
                    height: 2, 
                    width: 24,
                    alarms: [ props.regionalImpactAlarm ],
                    title: props.operation.operationName + " Regional Impact"
                }
            )
        ];

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            topLevelAggregateAlarms.push(
                new AlarmStatusWidget(
                    { 
                        height: 2, 
                        width: 8, 
                        alarms: [ props.isolatedAZImpactAlarms[i] ],
                        title: availabilityZoneId + " Isolated Impact"     
                    }
                )
            );
        }

        topLevelAggregateAlarms.push(new TextWidget({ height: 2, width: 24, markdown: "**AZ Contributors**" }));

        let zonalServerSideHighLatencyMetrics: IMetric[] = [];
        let zonalServerSideFaultCountMetrics: IMetric[] = [];

        let zonalCanaryHighLatencyMetrics: IMetric[] = [];
        let zonalCanaryFaultCountMetrics: IMetric[] = [];

        let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar("");

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            zonalServerSideHighLatencyMetrics.push(AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.serverSideLatencyMetricDetails,
                label: availabilityZoneId + " high latency responses",
                metricType: LatencyMetricType.SUCCESS_LATENCY,
                statistic: `TC(${props.operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
                keyPrefix: keyPrefix
            })[0]);

            zonalServerSideFaultCountMetrics.push(AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                label: availabilityZoneId + " fault count",
                metricType: AvailabilityMetricType.FAULT_COUNT,
                keyPrefix: keyPrefix
            }));

            zonalCanaryHighLatencyMetrics.push(AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.canaryLatencyMetricDetails,
                label: availabilityZoneId + " high latency responses",
                metricType: LatencyMetricType.SUCCESS_LATENCY,
                statistic: `TC(${props.operation.canaryLatencyMetricDetails.successAlarmThreshold}:)`
            })[0]);

            zonalCanaryFaultCountMetrics.push(AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.canaryAvailabilityMetricDetails,
                label: availabilityZoneId + " fault count",
                metricType: AvailabilityMetricType.FAULT_COUNT,
                keyPrefix: keyPrefix
            }));

            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
        }
          
        topLevelAggregateAlarms.push(new GraphWidget({
            height: 6,
            width: 24,
            title: "Server-side AZ Fault Contributors",
            left: zonalServerSideFaultCountMetrics
        }));

        topLevelAggregateAlarms.push(new GraphWidget({
            height: 6,
            width: 24,
            title: "Canary AZ Fault Contributors",
            left: zonalCanaryFaultCountMetrics
        }));

        topLevelAggregateAlarms.push(new GraphWidget({
            height: 6,
            width: 24,
            title: "Server-side High Latency Contributors",
            left: zonalServerSideHighLatencyMetrics
        }));

        topLevelAggregateAlarms.push(new GraphWidget({
            height: 6,
            width: 24,
            title: "Canary High Latency Contributors",
            left: zonalCanaryHighLatencyMetrics
        }));
            

        topLevelAggregateAlarms.push(new TextWidget({ height: 2, width: 24, markdown: "**Top Level Metrics**" }));

        topLevelAggregateAlarms.push(new GraphWidget({
            height: 6,
            width: 24,
            title: Fn.sub("${AWS::Region} TPS"),
            region: Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: Fn.ref("AWS::Region") + " tps",
                    metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                    metricType: AvailabilityMetricType.REQUEST_COUNT
                })
            ],
            statistic: "Sum",       
            leftYAxis: {
                label: "TPS",
                showUnits: false
            }
        }));

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            topLevelAggregateAlarms.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " TPS",
                region: Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " tps",
                        metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                        metricType: AvailabilityMetricType.REQUEST_COUNT
                    })                   
                ],
                statistic: "Sum",       
                leftYAxis: {
                    label: "TPS",
                    showUnits:  false
                }
            }));
        }

        return topLevelAggregateAlarms;    
    }

    private static createAvailabilityWidgets(props: IOperationAvailabilityAndLatencyWidgetProps, title: string) : IWidget[]
    {
        let availabilityWidgets: IWidget[] = [];  
        availabilityWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }));
        
        let rowTracker: number = 0;
        let keyPrefix1: string = AvailabilityAndLatencyMetrics.nextChar("");
        let keyPrefix2: string = AvailabilityAndLatencyMetrics.nextChar(keyPrefix1);

        // Create regional availability and fault metrics and availability alarm widgets    
        availabilityWidgets.push(new GraphWidget({
            height: 8,
            width: 24,
            title: Fn.sub("${AWS::Region} Availability"),
            region: Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: Fn.ref("AWS::Region") + " availability",
                    metricDetails: props.availabilityMetricDetails,
                    metricType: AvailabilityMetricType.SUCCESS_RATE,
                    keyPrefix: keyPrefix1
                })                
            ],
            statistic: "Sum",       
            leftYAxis: {
                max: 100,
                min: 95,
                label: "Availability",
                showUnits: false
            },
            leftAnnotations: [
                {
                    value: props.availabilityMetricDetails.successAlarmThreshold,
                    visible: true,
                    color: Color.RED,
                    label: "High Severity"
                }
            ],
            right: [
                AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: Fn.ref("AWS::Region") + " fault count",
                    metricDetails: props.availabilityMetricDetails,
                    metricType: AvailabilityMetricType.FAULT_COUNT,
                    keyPrefix: keyPrefix2
                })
            ],
            rightYAxis: {
                label: "Fault Count",
                showUnits: false
            }
        }));     

        availabilityWidgets.push(new AlarmWidget({ 
                height: 2, 
                width: 24, 
                region: Fn.sub("${AWS::Region}"),
                alarm: props.regionalEndpointAvailabilityAlarm
            }
        )); 

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            let keyPrefix1: string = AvailabilityAndLatencyMetrics.nextChar("");
            let keyPrefix2: string = AvailabilityAndLatencyMetrics.nextChar(keyPrefix1);

            availabilityWidgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Availability",
                region: Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " availability",
                        metricDetails: props.availabilityMetricDetails,
                        metricType: AvailabilityMetricType.SUCCESS_RATE,
                        keyPrefix: keyPrefix1
                    })
                ],
                statistic: "Sum",
                leftYAxis: {
                    max: 100,
                    min: 95,
                    label: "Availability",
                    showUnits: false
                },
                leftAnnotations: [
                    {
                        value: props.availabilityMetricDetails.successAlarmThreshold,
                        visible: true,
                        color: Color.RED,
                        label:  "High Severity"
                    }
                ],
                right: [
                    AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " fault count",
                        metricDetails: props.availabilityMetricDetails,
                        metricType: AvailabilityMetricType.FAULT_COUNT,
                        keyPrefix: keyPrefix2
                    })
                ],
                rightYAxis: {
                    label: "Fault Count",
                    showUnits: false
                }               
            }));

            //We're on the third one for this set, add 3 alarms
            //or if we're at the end, at the necessary amount
            //of alarms, 1, 2, or 3
            if (i % 3 == 2 || i - 1 == props.azCount)
            {
                for (let k = rowTracker; k <= i ; k++)
                {
                    availabilityWidgets.push(new AlarmWidget({ 
                            height: 2, 
                            width: 8, 
                            region: Fn.sub("${AWS::Region}"),
                            alarm: props.zonalEndpointAvailabilityAlarms[k]                              
                        }
                    )); 
                }

                rowTracker += i + 1;
            }
        }

        if (!props.isCanary)
        {
            availabilityWidgets.push(new ContributorInsightsWidget({
                height: 6,
                width: 24,
                title: "Individual Instance Contributors to Fault Count",
                insightRule: props.instanceContributorsToFaults,
                period: props.availabilityMetricDetails.period,
                legendPosition: LegendPosition.BOTTOM,
                orderStatistic: "Sum",
                accountId: Fn.ref("AWS::AccountId"),
                topContributors: 10                
            }));
        }

        return availabilityWidgets;
    }

    private static createLatencyWidgets(props: IOperationAvailabilityAndLatencyWidgetProps, title: string) : IWidget[]
    {
        let latencyWidgets: IWidget[] = [];  
        latencyWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }));
        
        let rowTracker: number = 0;
        let keyPrefix: string = "";

        let latencySuccessMetrics: IMetric[] = props.latencyMetricDetails.graphedSuccessStatistics.map(x => {
            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

            return AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: x + " Success Latency",
                metricDetails: props.latencyMetricDetails,
                metricType: LatencyMetricType.SUCCESS_LATENCY,
                statistic: x,
                keyPrefix: keyPrefix
            })[0];
        });

        let latencyFaultMetrics: IMetric[] = props.latencyMetricDetails.graphedFaultStatistics.map(x => {
            keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

            return AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: x + " Fault Latency",
                metricDetails: props.latencyMetricDetails,
                metricType: LatencyMetricType.FAULT_LATENCY,
                statistic: x,
                keyPrefix: keyPrefix
            })[0];
        });

        latencyWidgets.push(new GraphWidget({
            height: 8,
            width: 24,
            title: Fn.sub("${AWS::Region} Latency"),
            region: Fn.sub("${AWS::Region}"),
            left: latencySuccessMetrics.concat(latencyFaultMetrics),
            leftYAxis: {
                max: props.latencyMetricDetails.successAlarmThreshold * 1.5,
                min: 0,
                label: "Latency",
                showUnits: false
            },
            leftAnnotations: [
                {
                    value: props.latencyMetricDetails.successAlarmThreshold,
                    visible: true,
                    color: Color.RED,
                    label: "High Severity"
                }
            ]
        }));

        latencyWidgets.push(new AlarmWidget(
            { 
                height: 2, 
                width: 24, 
                region: Fn.sub("${AWS::Region}"),
                alarm: props.regionalEndpointLatencyAlarm
            }
        ));

        keyPrefix = "";
            
        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            let zonalSuccessLatencyMetrics: IMetric[] = props.latencyMetricDetails.graphedSuccessStatistics.map(x => {
               
                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

                return AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                    label: x + " Success Latency",
                    metricDetails: props.latencyMetricDetails,
                    metricType: LatencyMetricType.SUCCESS_LATENCY,
                    statistic: x,
                    availabilityZoneId: availabilityZoneId,
                    keyPrefix: keyPrefix
                })[0];
            });

            let zonalFaultLatencyMetrics: IMetric[] = props.latencyMetricDetails.graphedFaultStatistics.map(x => {
                keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

                return AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                    label: x + " Fault Latency",
                    metricDetails: props.latencyMetricDetails,
                    metricType: LatencyMetricType.FAULT_LATENCY,
                    statistic: x,
                    availabilityZoneId: availabilityZoneId,
                    keyPrefix: keyPrefix
                })[0];
            });
                
            latencyWidgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Latency",
                region: Fn.sub("${AWS::Region}"),
                left: zonalSuccessLatencyMetrics.concat(zonalFaultLatencyMetrics),                
                leftAnnotations: [ 
                    {
                        value: props.latencyMetricDetails.successAlarmThreshold,
                        visible: true,
                        color: Color.RED,
                        label: "High Severity"
                    }
                ],
                leftYAxis: {
                    max: props.latencyMetricDetails.successAlarmThreshold * 1.5,
                    min: 0,
                    label: "Latency",
                    showUnits: false
                },
            }));
            //We're on the third one for this set, add 3 alarms
            //or if we're at the end, at the necessary amount
            //of alarms, 1, 2, or 3
            if (i % 3 == 2 || i - 1 == props.azCount)
            {
                for (let k = rowTracker; k <= i ; k++)
                {
                    latencyWidgets.push(new AlarmWidget({ 
                            height: 2, 
                            width: 8, 
                            region: Fn.sub("${AWS::Region}"),
                            alarm: props.zonalEndpointLatencyAlarms[k]
                        }
                    )); 
                }
                rowTracker += i + 1;
            }
        }

        if (!props.isCanary)
        {
            latencyWidgets.push(new ContributorInsightsWidget({
                height: 6,
                width: 24,
                title: "Individual Instance Contributors to High Latency",
                insightRule: props.instanceContributorsToHighLatency,
                period: props.latencyMetricDetails.period,
                legendPosition: LegendPosition.BOTTOM,
                orderStatistic: "Sum",
                accountId: Fn.ref("AWS::AccountId"),
                topContributors: 10                
            }));
        }

        return latencyWidgets;
    }

    private static createApplicationLoadBalancerWidgets(props: IOperationAvailabilityAndLatencyDashboardProps, title: string) : IWidget[]
    {
        let albWidgets: IWidget[] = [];
        let loadBalancerFullName: string = (props.loadBalancer as BaseLoadBalancer).loadBalancerFullName;

        albWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }))

        albWidgets.push(new GraphWidget({
            height: 8,
            width: 24,
            title: Fn.sub("${AWS::Region} Fault Rate"),
            region: Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics.createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, props.operation.serverSideAvailabilityMetricDetails.period)
            ],
            leftYAxis: {
                max: 20,
                min: 0,
                label: "Fault Rate",
                showUnits: false
            },
            leftAnnotations: [
                {
                    value: 1,
                    visible: true,
                    color: Color.RED,
                    label: "High severity"
                }
            ]
        }));

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);
            let availabilityZoneName: string = Fn.select(0, Fn.split(":", Fn.select(i, Fn.split(",", props.azMap))));

            albWidgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Fault Rate",
                region: Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics.createZonalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, availabilityZoneName, props.operation.serverSideAvailabilityMetricDetails.period)
                ],
                leftYAxis: {
                    max: 20,
                    min: 0,
                    label: "Fault Rate"
                },
                leftAnnotations: [
                    {
                        value: 1,
                        visible: true,
                        color: Color.RED,
                        label: "High severity"
                    }
                ]
            }));
        }

        albWidgets.push(new GraphWidget({
            height: 8,
            width: 24,
            title: Fn.sub("${AWS::Region} Processed Bytes"),
            region: Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics.createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, props.operation.serverSideAvailabilityMetricDetails.period)
            ],
            leftYAxis: {
                label: "Processed Bytes",
                showUnits: true
            }
        }));

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);
            let availabilityZoneName: string = Fn.select(0, Fn.split(":", Fn.select(i, Fn.split(",", props.azMap))));

            albWidgets.push(new GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Processed Bytes",
                region: Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics.createZonalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, availabilityZoneName, props.operation.serverSideAvailabilityMetricDetails.period)
                ],
                leftYAxis: {
                    label: "Processed Bytes",
                    showUnits: true
                }
            }));
        }

        return albWidgets;
    }
}