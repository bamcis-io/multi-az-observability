import { Construct } from "constructs";
import { IOperationAvailabilityAndLatencyDashboardProps } from "./IOperationAvailabilityAndLatencyDashboardProps";
import { Dashboard, IMetric, PeriodOverride, IWidget, TextWidget, AlarmWidget, AlarmStatusWidget, GraphWidget } from "aws-cdk-lib/aws-cloudwatch";
import { Fn } from "aws-cdk-lib";
import { AvailabilityAndLatencyMetrics } from "./AvailabilityAndLatencyMetrics";

export class OperationAvailabilityAndLatencyDashboard extends Construct 
{
    constructor(scope: Construct, id: string, props: IOperationAvailabilityAndLatencyDashboardProps)
    {
        super(scope, id);

        let dashboard : Dashboard = new Dashboard(this, props.operation.operationName + "dashboard", {
            dashboardName: props.operation.operationName.toLowerCase() + Fn.sub("-operation-availability-and-latency-${AWS::Region}"),
            defaultInterval: props.interval,
            periodOverride: PeriodOverride.INHERIT,
            widgets: [ 
                OperationAvailabilityAndLatencyDashboard.createTopLevelAggregateAlarmWidgets(props, "**Top Level Aggregate Alarms**"),
                OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(props, false, "**Server-side Availability**"),
                OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(props, false, "**Server-side Latency**"),
                OperationAvailabilityAndLatencyDashboard.createApplicationLoadBalancerWidgets(props, "**Application Load Balancer Metrics**"),
                OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(props, true, "**Canary Measured Availability**"),
                OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(props, true, "**Canary Measured Latency**")
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

        let keyPrefix: string = 'a';

        for (let i = 0; i < props.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);

            zonalServerSideHighLatencyMetrics.push(AvailabilityAndLatencyMetrics.createZonalLatencyMetric(new ZonalLatencyMetricProps() {
                AvailabilityZoneId = azId,
                MetricDetails = props.Operation.ServerSideLatencyMetricDetails,
                Label = azId + " high latency responses",
                MetricType = LatencyMetricType.SUCCESS_LATENCY,
                Statistic = $"TC({props.Operation.ServerSideLatencyMetricDetails.SuccessAlarmThreshold}:)",
                Scope = Scope.OPERATION_ZONAL             
            })[0]);

                zonalServerSideFaultCountMetrics.Add(AvailabilityAndLatencyMetrics.CreateZonalAvailabilityMetric(new ZonalAvailabilityMetricProps() {
                    AvailabilityZoneId = azId,
                    MetricDetails = props.Operation.ServerSideAvailabilityMetricDetails,
                    Label = azId + " fault count",
                    MetricType = AvailabilityMetricType.FAULT_COUNT,
                    Scope = Scope.OPERATION_ZONAL,
                    KeyPrefix = keyPrefix.ToString()
                }));

                zonalCanaryHighLatencyMetrics.Add(AvailabilityAndLatencyMetrics.CreateZonalLatencyMetric(new ZonalLatencyMetricProps() {
                    AvailabilityZoneId = azId,
                    MetricDetails = props.Operation.CanaryLatencyMetricDetails,
                    Label = azId + " high latency responses",
                    MetricType = LatencyMetricType.SUCCESS_LATENCY,
                    Statistic = $"TC({props.Operation.CanaryLatencyMetricDetails.SuccessAlarmThreshold}:)",
                    Scope = Scope.OPERATION_ZONAL              
                })[0]);

                zonalCanaryFaultCountMetrics.Add(AvailabilityAndLatencyMetrics.CreateZonalAvailabilityMetric(new ZonalAvailabilityMetricProps() {
                    AvailabilityZoneId = azId,
                    MetricDetails = props.Operation.CanaryAvailabilityMetricDetails,
                    Label = azId + " fault count",
                    MetricType = AvailabilityMetricType.FAULT_COUNT,
                    Scope = Scope.OPERATION_ZONAL,
                    KeyPrefix = keyPrefix.ToString()
                }));

                keyPrefix++;
            }
          
            topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                Height = 6,
                Width = 24,
                Title = "Server-side AZ Fault Contributors",
                Left = zonalServerSideFaultCountMetrics.ToArray()
            }));

            topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                Height = 6,
                Width = 24,
                Title = "Canary AZ Fault Contributors",
                Left = zonalCanaryFaultCountMetrics.ToArray()
            }));

            topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                Height = 6,
                Width = 24,
                Title = "Server-side High Latency Contributors",
                Left = zonalServerSideHighLatencyMetrics.ToArray()
            }));

            topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                Height = 6,
                Width = 24,
                Title = "Canary High Latency Contributors",
                Left = zonalCanaryHighLatencyMetrics.ToArray()
            }));
            

            topLevelAggregateAlarms.Add(new TextWidget(new TextWidgetProps() { Height = 2, Width = 24, Markdown = "**Top Level Metrics**" }));

            topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                Height = 6,
                Width = 24,
                Title = Fn.Sub("${AWS::Region} TPS"),
                Region = Fn.Sub("${AWS::Region}"),
                Left = new IMetric[] {
                    AvailabilityAndLatencyMetrics.CreateRegionalAvailabilityMetric(new RegionalAvailabilityMetricProps() {
                        Label = Fn.Ref("AWS::Region") + " tps",
                        MetricDetails = props.Operation.ServerSideAvailabilityMetricDetails,
                        MetricType = AvailabilityMetricType.REQUEST_COUNT,
                        Scope = Scope.OPERATION_REGIONAL                         
                    })
                },
                Statistic = "Sum",       
                LeftYAxis = new YAxisProps() {
                    Label = "TPS",
                    ShowUnits = false
                }
            }));

            for (int i = 0; i < props.AZCount; i++)
            {
                string azId = Fn.Select(i, Fn.Split(",", props.AZIdList));;

                topLevelAggregateAlarms.Add(new GraphWidget(new GraphWidgetProps() {
                    Height = 6,
                    Width = 8,
                    Title = azId + " TPS",
                    Region = Fn.Sub("${AWS::Region}"),
                    Left = new IMetric[] {
                        AvailabilityAndLatencyMetrics.CreateZonalAvailabilityMetric(new ZonalAvailabilityMetricProps() {
                            AvailabilityZoneId = azId,
                            Label = azId + " tps",
                            MetricDetails = props.Operation.ServerSideAvailabilityMetricDetails,
                            MetricType = AvailabilityMetricType.REQUEST_COUNT,
                            Scope = Scope.OPERATION_ZONAL
                        })                   
                    },
                    Statistic = "Sum",       
                    LeftYAxis = new YAxisProps() {
                        Label = "TPS",
                        ShowUnits = false
                    }
                }));
            }

            return topLevelAggregateAlarms.ToArray();    
        }
}