"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAvailabilityAndLatencyDashboard = void 0;
const constructs_1 = require("constructs");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const AvailabilityMetricType_1 = require("../utilities/AvailabilityMetricType");
const AvailabilityAndLatencyMetrics_1 = require("../metrics/AvailabilityAndLatencyMetrics");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const AvailabilityZoneMapper_1 = require("../utilities/AvailabilityZoneMapper");
/**
 * Creates a service level availability and latency dashboard
 */
class ServiceAvailabilityAndLatencyDashboard extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        let topLevelAggregateAlarmWidgets = [];
        let azMapper = new AvailabilityZoneMapper_1.AvailabilityZoneMapper(this, "AZMapper", {
            availabilityZoneNames: props.service.availabilityZoneNames
        });
        let availabilityZoneIds = props.service.availabilityZoneNames.map(x => {
            return azMapper.availabilityZoneId(x);
        });
        topLevelAggregateAlarmWidgets.push(new aws_cloudwatch_1.TextWidget({
            height: 2,
            width: 24,
            markdown: "***Availability and Latency Alarms***"
        }));
        topLevelAggregateAlarmWidgets.push(new aws_cloudwatch_1.AlarmStatusWidget({
            height: 2,
            width: 24,
            alarms: [
                props.aggregateRegionalAlarm
            ],
            title: "Customer Experience - Regional Aggregate Impact Alarm (measures fault count in aggregate across all critical operations)"
        }));
        let keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar("");
        let perOperationAZFaultsMetrics = [];
        for (let i = 0; i < props.service.availabilityZoneNames.length; i++) {
            let counter = 1;
            let availabilityZoneId = azMapper.availabilityZoneId(props.service.availabilityZoneNames[i]);
            topLevelAggregateAlarmWidgets.push(new aws_cloudwatch_1.AlarmStatusWidget({
                height: 2,
                width: 8,
                alarms: [
                    props.zonalAggregateAlarms[i]
                ],
                title: availabilityZoneId + " Zonal Isolated Impact Alarm (any critical operation in this AZ shows impact from server-side or canary)"
            }));
            let usingMetrics = {};
            props.service.operations.filter(x => x.isCritical == true).forEach(x => {
                usingMetrics[`${keyPrefix}${counter++}`] = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                    availabilityZoneId: availabilityZoneId,
                    metricDetails: x.serverSideAvailabilityMetricDetails,
                    label: availabilityZoneId + " " + x.operationName + " fault count",
                    metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
                    keyPrefix: keyPrefix
                });
            });
            let zonalFaultCount = new aws_cloudwatch_1.MathExpression({
                expression: Object.keys(usingMetrics).join("+"),
                label: availabilityZoneId + " fault count",
                usingMetrics: usingMetrics
            });
            perOperationAZFaultsMetrics.push(zonalFaultCount);
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
        }
        let azContributorWidgets = [
            new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**AZ Contributors To Faults**" }),
            new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 24,
                title: "AZ Fault Count",
                period: props.service.period,
                left: perOperationAZFaultsMetrics
            })
        ];
        topLevelAggregateAlarmWidgets.concat(ServiceAvailabilityAndLatencyDashboard.generateTPSWidgets(props, availabilityZoneIds));
        this.dashboard = new aws_cloudwatch_1.Dashboard(this, "TopLevelDashboard", {
            dashboardName: props.service.serviceName.toLowerCase() + aws_cdk_lib_1.Fn.sub("-service-availability-and-latency-${AWS::Region}"),
            defaultInterval: props.interval,
            periodOverride: aws_cloudwatch_1.PeriodOverride.INHERIT,
            widgets: [
                topLevelAggregateAlarmWidgets,
                azContributorWidgets,
                ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryAvailabilityWidgets(props, availabilityZoneIds)
            ]
        });
    }
    static generateTPSWidgets(props, availabilityZoneIds) {
        let widgets = [];
        widgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**TPS Metrics**" }));
        widgets.push(new aws_cloudwatch_1.GraphWidget({
            height: 6,
            width: 24,
            title: aws_cdk_lib_1.Fn.ref("AWS::Region") + " TPS",
            region: aws_cdk_lib_1.Fn.ref("AWS::Region"),
            left: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " tps",
                period: props.service.period,
                availabilityMetricProps: props.service.operations.filter(x => x.isCritical).map(x => {
                    return {
                        label: x.operationName,
                        metricDetails: x.serverSideAvailabilityMetricDetails,
                        metricType: AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT
                    };
                })
            }),
            statistic: "Sum",
            leftYAxis: {
                label: "TPS",
                showUnits: false
            }
        }));
        for (let i = 0; i < availabilityZoneIds.length; i++) {
            let availabilityZoneId = availabilityZoneIds[i];
            let zonalMetricProps = {
                availabilityMetricProps: props.service.operations.filter(x => x.isCritical).map(x => {
                    return {
                        availabilityZoneId: availabilityZoneId,
                        label: x.operationName,
                        metricDetails: x.serverSideAvailabilityMetricDetails,
                        metricType: AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT
                    };
                }),
                period: props.service.period,
                label: availabilityZoneId + "tps"
            };
            widgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " TPS",
                region: aws_cdk_lib_1.Fn.ref("AWS::Region"),
                left: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics(zonalMetricProps),
                statistic: "Sum",
                leftYAxis: {
                    label: "TPS",
                    showUnits: false
                }
            }));
        }
        return widgets;
    }
    static generateServerSideAndCanaryAvailabilityWidgets(props, availabilityZoneIds) {
        let widgets = [];
        widgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**Server-side Availability**\n(Each operation is equally weighted regardless of request volume)" }));
        widgets = widgets.concat(ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, false, availabilityZoneIds));
        if (props.service.operations.filter(x => x.isCritical && x.canaryMetricDetails !== undefined).length > 0) {
            widgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**Canary Measured Availability**\n(Each operation is equally weighted regardless of request volume)" }));
            widgets = widgets.concat(ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, true, availabilityZoneIds));
        }
        return widgets;
    }
    static generateAvailabilityWidgets(props, isCanary, availabilityZoneIds) {
        let widgets = [];
        widgets.push(new aws_cloudwatch_1.GraphWidget({
            height: 6,
            width: 24,
            title: aws_cdk_lib_1.Fn.ref("AWS::Region") + " Availability",
            region: aws_cdk_lib_1.Fn.ref("AWS::Region"),
            left: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " availability",
                period: props.service.period,
                availabilityMetricProps: this.createRegionalAvailabilityMetricProps(props.service.operations.filter(x => x.isCritical), isCanary, AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE)
            }),
            statistic: "Sum",
            leftYAxis: {
                max: 100,
                min: 95,
                label: "Availability",
                showUnits: false
            },
            right: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " faults",
                period: props.service.period,
                availabilityMetricProps: this.createRegionalAvailabilityMetricProps(props.service.operations.filter(x => x.isCritical), isCanary, AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT)
            }),
            rightYAxis: {
                label: "Faults",
                showUnits: false,
                min: 0,
                max: Math.ceil(props.service.faultCountThreshold * 1.5)
            },
            rightAnnotations: [
                {
                    color: aws_cloudwatch_1.Color.RED,
                    label: "High severity",
                    value: props.service.faultCountThreshold
                }
            ]
        }));
        for (let i = 0; i < availabilityZoneIds.length; i++) {
            let availabilityZoneId = availabilityZoneIds[i];
            widgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Availability",
                region: aws_cdk_lib_1.Fn.ref("AWS::Region"),
                left: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics({
                    label: availabilityZoneId + " availability",
                    period: props.service.period,
                    availabilityMetricProps: this.createZonalAvailabilityMetricProps(props.service.operations.filter(x => x.isCritical), availabilityZoneId, isCanary, AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE)
                }),
                statistic: "Sum",
                leftYAxis: {
                    max: 100,
                    min: 95,
                    label: "Availability",
                    showUnits: false
                },
                right: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics({
                    label: availabilityZoneId + " faults",
                    period: props.service.period,
                    availabilityMetricProps: this.createZonalAvailabilityMetricProps(props.service.operations.filter(x => x.isCritical), availabilityZoneId, isCanary, AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT)
                }),
                rightYAxis: {
                    label: "Faults",
                    showUnits: false,
                    min: 0,
                    max: Math.ceil(props.service.faultCountThreshold * 1.5)
                },
                rightAnnotations: [
                    {
                        color: aws_cloudwatch_1.Color.RED,
                        label: "High severity",
                        value: props.service.faultCountThreshold
                    }
                ]
            }));
        }
        return widgets;
    }
    static createRegionalAvailabilityMetricProps(criticalOperations, isCanary, metricType) {
        return criticalOperations.reduce((filtered, value) => {
            if (isCanary && value.canaryMetricDetails !== undefined && value.canaryMetricDetails != null) {
                filtered.push(value.canaryMetricDetails.canaryAvailabilityMetricDetails);
            }
            else if (!isCanary) {
                filtered.push(value.serverSideAvailabilityMetricDetails);
            }
            return filtered;
        }, [])
            .map(x => {
            return {
                label: x.operationName + " faults",
                metricDetails: x,
                metricType: metricType
            };
        });
    }
    static createZonalAvailabilityMetricProps(criticalOperations, availabilityZoneId, isCanary, metricType) {
        return criticalOperations.reduce((filtered, value) => {
            if (isCanary && value.canaryMetricDetails !== undefined && value.canaryMetricDetails != null) {
                filtered.push(value.canaryMetricDetails.canaryAvailabilityMetricDetails);
            }
            else if (!isCanary) {
                filtered.push(value.serverSideAvailabilityMetricDetails);
            }
            return filtered;
        }, [])
            .map(x => {
            return {
                label: x.operationName + " faults",
                metricDetails: x,
                metricType: metricType,
                availabilityZoneId: availabilityZoneId
            };
        });
    }
}
exports.ServiceAvailabilityAndLatencyDashboard = ServiceAvailabilityAndLatencyDashboard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFFdkMsK0RBQTRKO0FBQzVKLGdGQUE2RTtBQUM3RSw0RkFBeUY7QUFDekYsNkNBQWlDO0FBS2pDLGdGQUE2RTtBQUc3RTs7R0FFRztBQUNILE1BQWEsc0NBQXVDLFNBQVEsc0JBQVM7SUFPakUsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrRDtRQUV4RixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksNkJBQTZCLEdBQWMsRUFBRSxDQUFDO1FBRWxELElBQUksUUFBUSxHQUE0QixJQUFJLCtDQUFzQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDakYscUJBQXFCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7U0FDN0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxtQkFBbUIsR0FBYSxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUM1RSxPQUFPLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQTtRQUVGLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFVLENBQUM7WUFDOUMsTUFBTSxFQUFFLENBQUM7WUFDVCxLQUFLLEVBQUUsRUFBRTtZQUNULFFBQVEsRUFBRSx1Q0FBdUM7U0FDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSiw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQ0FBaUIsQ0FBQztZQUNyRCxNQUFNLEVBQUUsQ0FBQztZQUNULEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFO2dCQUNKLEtBQUssQ0FB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QUMsbUJBQW1CLElBQUksSUFBSSxFQUM1RixDQUFDO2dCQUNHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDN0UsQ0FBQztpQkFDSSxJQUFJLENBQUMsUUFBUSxFQUNsQixDQUFDO2dCQUNHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUMsRUFBRSxFQUErQixDQUFDO2FBQ2xDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNMLE9BQU87Z0JBQ0gsS0FBSyxFQUFFLENBQUMsQ0FBQyxhQUFhLEdBQUcsU0FBUztnQkFDbEMsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixrQkFBa0IsRUFBRSxrQkFBa0I7YUFDekMsQ0FBQTtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdlRELHdGQXVUQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFByb3BzIH0gZnJvbSBcIi4vcHJvcHMvU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRQcm9wc1wiO1xuaW1wb3J0IHsgQWxhcm1TdGF0dXNXaWRnZXQsIENvbG9yLCBEYXNoYm9hcmQsIEdyYXBoV2lkZ2V0LCBJTWV0cmljLCBJV2lkZ2V0LCBNYXRoRXhwcmVzc2lvbiwgUGVyaW9kT3ZlcnJpZGUsIFRleHRXaWRnZXQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2hcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0F2YWlsYWJpbGl0eU1ldHJpY1R5cGVcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzIH0gZnJvbSBcIi4uL21ldHJpY3MvQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3NcIjtcbmltcG9ydCB7IEZuIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBJU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQgfSBmcm9tIFwiLi9JU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRcIjtcbmltcG9ydCB7IElPcGVyYXRpb24gfSBmcm9tIFwiLi4vc2VydmljZXMvSU9wZXJhdGlvblwiO1xuaW1wb3J0IHsgSU9wZXJhdGlvbk1ldHJpY0RldGFpbHMgfSBmcm9tIFwiLi4vc2VydmljZXMvSU9wZXJhdGlvbk1ldHJpY0RldGFpbHNcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzIH0gZnJvbSBcIi4uL21ldHJpY3MvcHJvcHMvQXZhaWxhYmlsaXR5TWV0cmljUHJvcHNcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXIgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0F2YWlsYWJpbGl0eVpvbmVNYXBwZXJcIjtcbmltcG9ydCB7IElBdmFpbGFiaWxpdHlab25lTWFwcGVyIH0gZnJvbSBcIi4uL011bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHlcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2VydmljZSBsZXZlbCBhdmFpbGFiaWxpdHkgYW5kIGxhdGVuY3kgZGFzaGJvYXJkXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZCBleHRlbmRzIENvbnN0cnVjdCBpbXBsZW1lbnRzIElTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFxue1xuICAgIC8qKlxuICAgICAqIFRoZSBzZXJ2aWNlIGxldmVsIGRhc2hib2FyZFxuICAgICAqL1xuICAgIGRhc2hib2FyZDogRGFzaGJvYXJkO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFNlcnZpY2VBdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkUHJvcHMpXG4gICAge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGxldCB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtV2lkZ2V0czogSVdpZGdldFtdID0gW107XG5cbiAgICAgICAgbGV0IGF6TWFwcGVyOiBJQXZhaWxhYmlsaXR5Wm9uZU1hcHBlciA9IG5ldyBBdmFpbGFiaWxpdHlab25lTWFwcGVyKHRoaXMsIFwiQVpNYXBwZXJcIiwge1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiBwcm9wcy5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lc1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkczogc3RyaW5nW10gPSBwcm9wcy5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lcy5tYXAoeCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXpNYXBwZXIuYXZhaWxhYmlsaXR5Wm9uZUlkKHgpO1xuICAgICAgICB9KVxuXG4gICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1XaWRnZXRzLnB1c2gobmV3IFRleHRXaWRnZXQoe1xuICAgICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgbWFya2Rvd246IFwiKioqQXZhaWxhYmlsaXR5IGFuZCBMYXRlbmN5IEFsYXJtcyoqKlwiXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtV2lkZ2V0cy5wdXNoKG5ldyBBbGFybVN0YXR1c1dpZGdldCh7XG4gICAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICBhbGFybXM6IFtcbiAgICAgICAgICAgICAgICBwcm9wcy5hZ2dyZWdhdGVSZWdpb25hbEFsYXJtXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdGl0bGU6IFwiQ3VzdG9tZXIgRXhwZXJpZW5jZSAtIFJlZ2lvbmFsIEFnZ3JlZ2F0ZSBJbXBhY3QgQWxhcm0gKG1lYXN1cmVzIGZhdWx0IGNvdW50IGluIGFnZ3JlZ2F0ZSBhY3Jvc3MgYWxsIGNyaXRpY2FsIG9wZXJhdGlvbnMpXCJcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGxldCBrZXlQcmVmaXg6IHN0cmluZyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKFwiXCIpO1xuICAgICAgICBsZXQgcGVyT3BlcmF0aW9uQVpGYXVsdHNNZXRyaWNzOiBJTWV0cmljW10gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLnNlcnZpY2UuYXZhaWxhYmlsaXR5Wm9uZU5hbWVzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgY291bnRlcjogbnVtYmVyID0gMTtcbiAgICAgICAgICAgIGxldCBhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZyA9IGF6TWFwcGVyLmF2YWlsYWJpbGl0eVpvbmVJZChwcm9wcy5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lc1tpXSk7XG5cbiAgICAgICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1XaWRnZXRzLnB1c2gobmV3IEFsYXJtU3RhdHVzV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgICAgYWxhcm1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnpvbmFsQWdncmVnYXRlQWxhcm1zW2ldXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0aXRsZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgWm9uYWwgSXNvbGF0ZWQgSW1wYWN0IEFsYXJtIChhbnkgY3JpdGljYWwgb3BlcmF0aW9uIGluIHRoaXMgQVogc2hvd3MgaW1wYWN0IGZyb20gc2VydmVyLXNpZGUgb3IgY2FuYXJ5KVwiXG4gICAgICAgICAgICB9KSlcblxuICAgICAgICAgICAgbGV0IHVzaW5nTWV0cmljczoge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG5cbiAgICAgICAgICAgIHByb3BzLnNlcnZpY2Uub3BlcmF0aW9ucy5maWx0ZXIoeCA9PiB4LmlzQ3JpdGljYWwgPT0gdHJ1ZSkuZm9yRWFjaCh4ID0+IHsgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fSR7Y291bnRlcisrfWBdID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogeC5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIFwiICsgeC5vcGVyYXRpb25OYW1lICsgXCIgZmF1bHQgY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVCxcbiAgICAgICAgICAgICAgICAgICAga2V5UHJlZml4OiBrZXlQcmVmaXhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgem9uYWxGYXVsdENvdW50OiBJTWV0cmljID0gbmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBPYmplY3Qua2V5cyh1c2luZ01ldHJpY3MpLmpvaW4oXCIrXCIpLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBmYXVsdCBjb3VudFwiLFxuICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljczogdXNpbmdNZXRyaWNzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcGVyT3BlcmF0aW9uQVpGYXVsdHNNZXRyaWNzLnB1c2goem9uYWxGYXVsdENvdW50KTtcbiAgICAgICAgICAgIGtleVByZWZpeCA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKGtleVByZWZpeCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXpDb250cmlidXRvcldpZGdldHM6IElXaWRnZXRbXSA9IFtcbiAgICAgICAgICAgIG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiBcIioqQVogQ29udHJpYnV0b3JzIFRvIEZhdWx0cyoqXCJ9KSxcbiAgICAgICAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJBWiBGYXVsdCBDb3VudFwiLFxuICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMuc2VydmljZS5wZXJpb2QsXG4gICAgICAgICAgICAgICAgbGVmdDogcGVyT3BlcmF0aW9uQVpGYXVsdHNNZXRyaWNzXG4gICAgICAgICAgICB9KVxuICAgICAgICBdXG5cbiAgICAgICAgdG9wTGV2ZWxBZ2dyZWdhdGVBbGFybVdpZGdldHMuY29uY2F0KFNlcnZpY2VBdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkLmdlbmVyYXRlVFBTV2lkZ2V0cyhwcm9wcywgYXZhaWxhYmlsaXR5Wm9uZUlkcykpO1xuXG4gICAgICAgIHRoaXMuZGFzaGJvYXJkID0gbmV3IERhc2hib2FyZCh0aGlzLCBcIlRvcExldmVsRGFzaGJvYXJkXCIsIHtcbiAgICAgICAgICAgIGRhc2hib2FyZE5hbWU6IHByb3BzLnNlcnZpY2Uuc2VydmljZU5hbWUudG9Mb3dlckNhc2UoKSArIEZuLnN1YihcIi1zZXJ2aWNlLWF2YWlsYWJpbGl0eS1hbmQtbGF0ZW5jeS0ke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgIGRlZmF1bHRJbnRlcnZhbDogcHJvcHMuaW50ZXJ2YWwsXG4gICAgICAgICAgICBwZXJpb2RPdmVycmlkZTogUGVyaW9kT3ZlcnJpZGUuSU5IRVJJVCxcbiAgICAgICAgICAgIHdpZGdldHM6IFtcbiAgICAgICAgICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtV2lkZ2V0cyxcbiAgICAgICAgICAgICAgICBhekNvbnRyaWJ1dG9yV2lkZ2V0cyxcbiAgICAgICAgICAgICAgICBTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZC5nZW5lcmF0ZVNlcnZlclNpZGVBbmRDYW5hcnlBdmFpbGFiaWxpdHlXaWRnZXRzKHByb3BzLCBhdmFpbGFiaWxpdHlab25lSWRzKVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZW5lcmF0ZVRQU1dpZGdldHMocHJvcHM6IFNlcnZpY2VBdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkUHJvcHMsIGF2YWlsYWJpbGl0eVpvbmVJZHM6IHN0cmluZ1tdKSA6IElXaWRnZXRbXVxuICAgIHtcbiAgICAgICAgbGV0IHdpZGdldHM6IElXaWRnZXRbXSA9IFtdO1xuXG4gICAgICAgIHdpZGdldHMucHVzaChuZXcgVGV4dFdpZGdldCh7aGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiBcIioqVFBTIE1ldHJpY3MqKlwiIH0pKTtcbiAgICAgICAgXG4gICAgICAgIHdpZGdldHMucHVzaChuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgdGl0bGU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCIgVFBTXCIsXG4gICAgICAgICAgICByZWdpb246IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgbGVmdDogQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlUmVnaW9uYWxTZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljcyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCIgdHBzXCIsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5zZXJ2aWNlLnBlcmlvZCxcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNQcm9wczogcHJvcHMuc2VydmljZS5vcGVyYXRpb25zLmZpbHRlcih4ID0+IHguaXNDcml0aWNhbCkubWFwKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHgub3BlcmF0aW9uTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHguc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlJFUVVFU1RfQ09VTlRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJUUFNcIixcbiAgICAgICAgICAgICAgICBzaG93VW5pdHM6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF2YWlsYWJpbGl0eVpvbmVJZHMubGVuZ3RoOyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZyA9IGF2YWlsYWJpbGl0eVpvbmVJZHNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB6b25hbE1ldHJpY1Byb3BzID0ge1xuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzOiBwcm9wcy5zZXJ2aWNlLm9wZXJhdGlvbnMuZmlsdGVyKHggPT4geC5pc0NyaXRpY2FsKS5tYXAoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB4Lm9wZXJhdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiB4LnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5SRVFVRVNUX0NPVU5UXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLnNlcnZpY2UucGVyaW9kLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcInRwc1wiXG4gICAgICAgICAgICB9OyAgICAgXG5cbiAgICAgICAgICAgIHdpZGdldHMucHVzaChuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogNixcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgVFBTXCIsXG4gICAgICAgICAgICAgICAgcmVnaW9uOiBGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbFNlcnZpY2VBdmFpbGFiaWxpdHlNZXRyaWNzKHpvbmFsTWV0cmljUHJvcHMpLFxuICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiVFBTXCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gd2lkZ2V0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZW5lcmF0ZVNlcnZlclNpZGVBbmRDYW5hcnlBdmFpbGFiaWxpdHlXaWRnZXRzKHByb3BzOiBTZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFByb3BzLCBhdmFpbGFiaWxpdHlab25lSWRzOiBzdHJpbmdbXSk6IElXaWRnZXRbXVxuICAgIHtcbiAgICAgICBsZXQgd2lkZ2V0czogSVdpZGdldFtdID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgd2lkZ2V0cy5wdXNoKG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiBcIioqU2VydmVyLXNpZGUgQXZhaWxhYmlsaXR5KipcXG4oRWFjaCBvcGVyYXRpb24gaXMgZXF1YWxseSB3ZWlnaHRlZCByZWdhcmRsZXNzIG9mIHJlcXVlc3Qgdm9sdW1lKVwiIH0pKTtcbiAgICBcbiAgICAgICAgd2lkZ2V0cyA9IHdpZGdldHMuY29uY2F0KFNlcnZpY2VBdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkLmdlbmVyYXRlQXZhaWxhYmlsaXR5V2lkZ2V0cyhwcm9wcywgZmFsc2UsIGF2YWlsYWJpbGl0eVpvbmVJZHMpKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm9wcy5zZXJ2aWNlLm9wZXJhdGlvbnMuZmlsdGVyKHggPT4geC5pc0NyaXRpY2FsICYmIHguY2FuYXJ5TWV0cmljRGV0YWlscyAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aWRnZXRzLnB1c2gobmV3IFRleHRXaWRnZXQoeyBoZWlnaHQ6IDIsIHdpZHRoOiAyNCwgbWFya2Rvd246IFwiKipDYW5hcnkgTWVhc3VyZWQgQXZhaWxhYmlsaXR5KipcXG4oRWFjaCBvcGVyYXRpb24gaXMgZXF1YWxseSB3ZWlnaHRlZCByZWdhcmRsZXNzIG9mIHJlcXVlc3Qgdm9sdW1lKVwiIH0pKTtcbiAgICAgICAgXG4gICAgICAgICAgICB3aWRnZXRzID0gd2lkZ2V0cy5jb25jYXQoU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQuZ2VuZXJhdGVBdmFpbGFiaWxpdHlXaWRnZXRzKHByb3BzLCB0cnVlLCBhdmFpbGFiaWxpdHlab25lSWRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB3aWRnZXRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdlbmVyYXRlQXZhaWxhYmlsaXR5V2lkZ2V0cyhwcm9wczogU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRQcm9wcywgaXNDYW5hcnk6IGJvb2xlYW4sIGF2YWlsYWJpbGl0eVpvbmVJZHM6IHN0cmluZ1tdKSA6IElXaWRnZXRbXVxuICAgIHtcbiAgICAgICAgbGV0IHdpZGdldHM6IElXaWRnZXRbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgd2lkZ2V0cy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICB0aXRsZTogRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcIiBBdmFpbGFiaWxpdHlcIixcbiAgICAgICAgICAgIHJlZ2lvbjogRm4ucmVmKFwiQVdTOjpSZWdpb25cIiksXG4gICAgICAgICAgICBsZWZ0OiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbFNlcnZpY2VBdmFpbGFiaWxpdHlNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogIEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCIgYXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5zZXJ2aWNlLnBlcmlvZCxcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNQcm9wczogdGhpcy5jcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKHByb3BzLnNlcnZpY2Uub3BlcmF0aW9ucy5maWx0ZXIoeCA9PiB4LmlzQ3JpdGljYWwpLCBpc0NhbmFyeSwgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5TVUNDRVNTX1JBVEUpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgIG1heDogMTAwLFxuICAgICAgICAgICAgICAgIG1pbjogOTUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiQXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgc2hvd1VuaXRzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJpZ2h0OiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbFNlcnZpY2VBdmFpbGFiaWxpdHlNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogIEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCIgZmF1bHRzXCIsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5zZXJ2aWNlLnBlcmlvZCxcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNQcm9wczogdGhpcy5jcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKHByb3BzLnNlcnZpY2Uub3BlcmF0aW9ucy5maWx0ZXIoeCA9PiB4LmlzQ3JpdGljYWwpLCBpc0NhbmFyeSwgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVClcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcmlnaHRZQXhpczoge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkZhdWx0c1wiLFxuICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgIG1heDogTWF0aC5jZWlsKHByb3BzLnNlcnZpY2UuZmF1bHRDb3VudFRocmVzaG9sZCAqIDEuNSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByaWdodEFubm90YXRpb25zOiBbIFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IENvbG9yLlJFRCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGlnaCBzZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcHMuc2VydmljZS5mYXVsdENvdW50VGhyZXNob2xkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdmFpbGFiaWxpdHlab25lSWRzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkID0gYXZhaWxhYmlsaXR5Wm9uZUlkc1tpXTtcblxuICAgICAgICAgICAgd2lkZ2V0cy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgIHRpdGxlOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBBdmFpbGFiaWxpdHlcIixcbiAgICAgICAgICAgICAgICByZWdpb246IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLmNyZWF0ZVpvbmFsU2VydmljZUF2YWlsYWJpbGl0eU1ldHJpY3Moe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgYXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMuc2VydmljZS5wZXJpb2QsXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzOiB0aGlzLmNyZWF0ZVpvbmFsQXZhaWxhYmlsaXR5TWV0cmljUHJvcHMocHJvcHMuc2VydmljZS5vcGVyYXRpb25zLmZpbHRlcih4ID0+IHguaXNDcml0aWNhbCksIGF2YWlsYWJpbGl0eVpvbmVJZCwgaXNDYW5hcnksIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuU1VDQ0VTU19SQVRFKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgbWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIG1pbjogOTUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkF2YWlsYWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgICAgICBzaG93VW5pdHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByaWdodDogQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxTZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljcyh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBmYXVsdHNcIixcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5zZXJ2aWNlLnBlcmlvZCxcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5TWV0cmljUHJvcHM6IHRoaXMuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyhwcm9wcy5zZXJ2aWNlLm9wZXJhdGlvbnMuZmlsdGVyKHggPT4geC5pc0NyaXRpY2FsKSwgYXZhaWxhYmlsaXR5Wm9uZUlkLCBpc0NhbmFyeSwgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVClcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICByaWdodFlBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkZhdWx0c1wiLFxuICAgICAgICAgICAgICAgICAgICBzaG93VW5pdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICAgICAgICAgIG1heDogTWF0aC5jZWlsKHByb3BzLnNlcnZpY2UuZmF1bHRDb3VudFRocmVzaG9sZCAqIDEuNSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJpZ2h0QW5ub3RhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IENvbG9yLlJFRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhpZ2ggc2V2ZXJpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wcy5zZXJ2aWNlLmZhdWx0Q291bnRUaHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pKTsgXG4gICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gd2lkZ2V0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKGNyaXRpY2FsT3BlcmF0aW9uczogSU9wZXJhdGlvbltdLCBpc0NhbmFyeTogYm9vbGVhbiwgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZSkgOiBBdmFpbGFiaWxpdHlNZXRyaWNQcm9wc1tdXG4gICAge1xuICAgICAgICByZXR1cm4gY3JpdGljYWxPcGVyYXRpb25zLnJlZHVjZSgoZmlsdGVyZWQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNDYW5hcnkgJiYgdmFsdWUuY2FuYXJ5TWV0cmljRGV0YWlscyAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmNhbmFyeU1ldHJpY0RldGFpbHMgIT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZC5wdXNoKHZhbHVlLmNhbmFyeU1ldHJpY0RldGFpbHMuY2FuYXJ5QXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghaXNDYW5hcnkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaCh2YWx1ZS5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgICAgIH0sIFtdIGFzIElPcGVyYXRpb25NZXRyaWNEZXRhaWxzW10pXG4gICAgICAgIC5tYXAoeCA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxhYmVsOiB4Lm9wZXJhdGlvbk5hbWUgKyBcIiBmYXVsdHNcIixcbiAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiB4LFxuICAgICAgICAgICAgICAgIG1ldHJpY1R5cGU6IG1ldHJpY1R5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyhjcml0aWNhbE9wZXJhdGlvbnM6IElPcGVyYXRpb25bXSxhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZywgaXNDYW5hcnk6IGJvb2xlYW4sIG1ldHJpY1R5cGU6IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUpIDogQXZhaWxhYmlsaXR5TWV0cmljUHJvcHNbXVxuICAgIHtcbiAgICAgICAgcmV0dXJuIGNyaXRpY2FsT3BlcmF0aW9ucy5yZWR1Y2UoKGZpbHRlcmVkLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQ2FuYXJ5ICYmIHZhbHVlLmNhbmFyeU1ldHJpY0RldGFpbHMgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS5jYW5hcnlNZXRyaWNEZXRhaWxzICE9IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaCh2YWx1ZS5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWlzQ2FuYXJ5KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpbHRlcmVkLnB1c2godmFsdWUuc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgICAgICB9LCBbXSBhcyBJT3BlcmF0aW9uTWV0cmljRGV0YWlsc1tdKVxuICAgICAgICAubWFwKHggPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogeC5vcGVyYXRpb25OYW1lICsgXCIgZmF1bHRzXCIsXG4gICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogeCxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBtZXRyaWNUeXBlLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=