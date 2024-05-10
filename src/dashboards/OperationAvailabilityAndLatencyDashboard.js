"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationAvailabilityAndLatencyDashboard = void 0;
const constructs_1 = require("constructs");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const AvailabilityAndLatencyMetrics_1 = require("../metrics/AvailabilityAndLatencyMetrics");
const LatencyMetricType_1 = require("../utilities/LatencyMetricType");
const AvailabilityMetricType_1 = require("../utilities/AvailabilityMetricType");
const ContributorInsightsWidget_1 = require("./ContributorInsightsWidget");
const AvailabilityZoneMapper_1 = require("../utilities/AvailabilityZoneMapper");
/**
 * Creates an operation level availability and latency dashboard
 */
class OperationAvailabilityAndLatencyDashboard extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        let widgets = [];
        this.azMapper = new AvailabilityZoneMapper_1.AvailabilityZoneMapper(this, "AZMapper", {
            availabilityZoneNames: props.operation.service.availabilityZoneNames
        });
        let availabilityZoneIds = props.operation.service.availabilityZoneNames.map(x => {
            return this.azMapper.availabilityZoneId(x);
        });
        widgets.push(OperationAvailabilityAndLatencyDashboard.createTopLevelAggregateAlarmWidgets(props, "**Top Level Aggregate Alarms**", availabilityZoneIds));
        widgets.push(OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets({
            operation: props.operation,
            availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
            latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
            availabilityZoneIds: availabilityZoneIds,
            interval: props.interval,
            isCanary: false,
            resolutionPeriod: aws_cdk_lib_1.Duration.minutes(60),
            zonalEndpointAvailabilityAlarms: props.zonalEndpointServerAvailabilityAlarms,
            zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
            regionalEndpointAvailabilityAlarm: props.regionalEndpointServerAvailabilityAlarm,
            regionalEndpointLatencyAlarm: props.regionalEndpointServerLatencyAlarm,
            instanceContributorsToFaults: props.instanceContributorsToFaults,
            instanceContributorsToHighLatency: props.instanceContributorsToHighLatency
        }, "**Server-side Availability**"));
        widgets.push(OperationAvailabilityAndLatencyDashboard.createLatencyWidgets({
            operation: props.operation,
            availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
            latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
            availabilityZoneIds: availabilityZoneIds,
            interval: props.interval,
            isCanary: false,
            resolutionPeriod: aws_cdk_lib_1.Duration.minutes(60),
            zonalEndpointAvailabilityAlarms: props.zonalEndpointServerAvailabilityAlarms,
            zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
            regionalEndpointAvailabilityAlarm: props.regionalEndpointServerAvailabilityAlarm,
            regionalEndpointLatencyAlarm: props.regionalEndpointServerLatencyAlarm,
            instanceContributorsToFaults: props.instanceContributorsToFaults,
            instanceContributorsToHighLatency: props.instanceContributorsToHighLatency
        }, "**Server-side Latency**"));
        if (props.loadBalancer !== undefined && props.loadBalancer != null) {
            widgets.push(this.createApplicationLoadBalancerWidgets(props, "**Application Load Balancer Metrics**", availabilityZoneIds));
        }
        if (props.operation.canaryMetricDetails !== undefined && props.operation.canaryMetricDetails != null) {
            widgets.push(OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets({
                operation: props.operation,
                availabilityMetricDetails: props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
                availabilityZoneIds: props.operation.service.availabilityZoneNames,
                interval: props.interval,
                isCanary: false,
                resolutionPeriod: aws_cdk_lib_1.Duration.minutes(60),
                zonalEndpointAvailabilityAlarms: props.zonalEndpointServerAvailabilityAlarms,
                zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
                regionalEndpointAvailabilityAlarm: props.regionalEndpointServerAvailabilityAlarm,
                regionalEndpointLatencyAlarm: props.regionalEndpointServerLatencyAlarm,
                instanceContributorsToFaults: props.instanceContributorsToFaults,
                instanceContributorsToHighLatency: props.instanceContributorsToHighLatency
            }, "**Canary Measured Availability**"));
            widgets.push(OperationAvailabilityAndLatencyDashboard.createLatencyWidgets({
                operation: props.operation,
                availabilityMetricDetails: props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
                availabilityZoneIds: props.operation.service.availabilityZoneNames,
                interval: props.interval,
                isCanary: false,
                resolutionPeriod: aws_cdk_lib_1.Duration.minutes(60),
                zonalEndpointAvailabilityAlarms: props.zonalEndpointServerAvailabilityAlarms,
                zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
                regionalEndpointAvailabilityAlarm: props.regionalEndpointServerAvailabilityAlarm,
                regionalEndpointLatencyAlarm: props.regionalEndpointServerLatencyAlarm,
                instanceContributorsToFaults: props.instanceContributorsToFaults,
                instanceContributorsToHighLatency: props.instanceContributorsToHighLatency
            }, "**Canary Measured Latency**"));
        }
        this.dashboard = new aws_cloudwatch_1.Dashboard(this, props.operation.operationName + "dashboard", {
            dashboardName: props.operation.operationName.toLowerCase() + aws_cdk_lib_1.Fn.sub("-operation-availability-and-latency-${AWS::Region}"),
            defaultInterval: props.interval,
            periodOverride: aws_cloudwatch_1.PeriodOverride.INHERIT,
            widgets: widgets
        });
    }
    static createTopLevelAggregateAlarmWidgets(props, title, availabilityZoneIds) {
        let topLevelAggregateAlarms = [
            new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: title }),
            new aws_cloudwatch_1.AlarmStatusWidget({
                height: 2,
                width: 24,
                alarms: [props.regionalImpactAlarm],
                title: props.operation.operationName + " Regional Impact"
            })
        ];
        for (let i = 0; i < availabilityZoneIds.length; i++) {
            let availabilityZoneId = availabilityZoneIds[i];
            topLevelAggregateAlarms.push(new aws_cloudwatch_1.AlarmStatusWidget({
                height: 2,
                width: 8,
                alarms: [props.isolatedAZImpactAlarms[i]],
                title: availabilityZoneId + " Isolated Impact"
            }));
        }
        topLevelAggregateAlarms.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**AZ Contributors**" }));
        let zonalServerSideHighLatencyMetrics = [];
        let zonalServerSideFaultCountMetrics = [];
        let zonalCanaryHighLatencyMetrics = [];
        let zonalCanaryFaultCountMetrics = [];
        let keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar("");
        for (let i = 0; i < availabilityZoneIds.length; i++) {
            let availabilityZoneId = availabilityZoneIds[i];
            zonalServerSideHighLatencyMetrics.push(AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.serverSideLatencyMetricDetails,
                label: availabilityZoneId + " high latency responses",
                metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                statistic: `TC(${props.operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
                keyPrefix: keyPrefix
            })[0]);
            zonalServerSideFaultCountMetrics.push(AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                label: availabilityZoneId + " fault count",
                metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
                keyPrefix: keyPrefix
            }));
            if (props.operation.canaryMetricDetails !== undefined && props.operation.canaryMetricDetails != null) {
                zonalCanaryHighLatencyMetrics.push(AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                    availabilityZoneId: availabilityZoneId,
                    metricDetails: props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
                    label: availabilityZoneId + " high latency responses",
                    metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                    statistic: `TC(${props.operation.canaryMetricDetails.canaryLatencyMetricDetails.successAlarmThreshold}:)`,
                    keyPrefix: keyPrefix
                })[0]);
                zonalCanaryFaultCountMetrics.push(AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                    availabilityZoneId: availabilityZoneId,
                    metricDetails: props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails,
                    label: availabilityZoneId + " fault count",
                    metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
                    keyPrefix: keyPrefix
                }));
            }
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
        }
        topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
            height: 6,
            width: 24,
            title: "Server-side AZ Fault Contributors",
            left: zonalServerSideFaultCountMetrics
        }));
        if (zonalCanaryFaultCountMetrics.length > 0) {
            topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 24,
                title: "Canary AZ Fault Contributors",
                left: zonalCanaryFaultCountMetrics
            }));
        }
        topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
            height: 6,
            width: 24,
            title: "Server-side High Latency Contributors",
            left: zonalServerSideHighLatencyMetrics
        }));
        if (zonalCanaryHighLatencyMetrics.length > 0) {
            topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 24,
                title: "Canary High Latency Contributors",
                left: zonalCanaryHighLatencyMetrics
            }));
        }
        topLevelAggregateAlarms.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: "**Top Level Metrics**" }));
        topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
            height: 6,
            width: 24,
            title: aws_cdk_lib_1.Fn.sub("${AWS::Region} TPS"),
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " tps",
                    metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                    metricType: AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT
                })
            ],
            statistic: "Sum",
            leftYAxis: {
                label: "TPS",
                showUnits: false
            }
        }));
        for (let i = 0; i < availabilityZoneIds.length; i++) {
            let availabilityZoneId = availabilityZoneIds[i];
            topLevelAggregateAlarms.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " TPS",
                region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " tps",
                        metricDetails: props.operation.serverSideAvailabilityMetricDetails,
                        metricType: AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT
                    })
                ],
                statistic: "Sum",
                leftYAxis: {
                    label: "TPS",
                    showUnits: false
                }
            }));
        }
        return topLevelAggregateAlarms;
    }
    static createAvailabilityWidgets(props, title) {
        let availabilityWidgets = [];
        availabilityWidgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: title }));
        let rowTracker = 0;
        let keyPrefix1 = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar("");
        let keyPrefix2 = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix1);
        // Create regional availability and fault metrics and availability alarm widgets    
        availabilityWidgets.push(new aws_cloudwatch_1.GraphWidget({
            height: 8,
            width: 24,
            title: aws_cdk_lib_1.Fn.sub("${AWS::Region} Availability"),
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " availability",
                    metricDetails: props.availabilityMetricDetails,
                    metricType: AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE,
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
                    color: aws_cloudwatch_1.Color.RED,
                    label: "High Severity"
                }
            ],
            right: [
                AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                    label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " fault count",
                    metricDetails: props.availabilityMetricDetails,
                    metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
                    keyPrefix: keyPrefix2
                })
            ],
            rightYAxis: {
                label: "Fault Count",
                showUnits: false
            }
        }));
        availabilityWidgets.push(new aws_cloudwatch_1.AlarmWidget({
            height: 2,
            width: 24,
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            alarm: props.regionalEndpointAvailabilityAlarm
        }));
        for (let i = 0; i < props.availabilityZoneIds.length; i++) {
            let availabilityZoneId = props.availabilityZoneIds[i];
            let keyPrefix1 = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar("");
            let keyPrefix2 = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix1);
            availabilityWidgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Availability",
                region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " availability",
                        metricDetails: props.availabilityMetricDetails,
                        metricType: AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE,
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
                        color: aws_cloudwatch_1.Color.RED,
                        label: "High Severity"
                    }
                ],
                right: [
                    AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                        availabilityZoneId: availabilityZoneId,
                        label: availabilityZoneId + " fault count",
                        metricDetails: props.availabilityMetricDetails,
                        metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
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
            if (i % 3 == 2 || i - 1 == props.availabilityZoneIds.length) {
                for (let k = rowTracker; k <= i; k++) {
                    availabilityWidgets.push(new aws_cloudwatch_1.AlarmWidget({
                        height: 2,
                        width: 8,
                        region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                        alarm: props.zonalEndpointAvailabilityAlarms[k]
                    }));
                }
                rowTracker += i + 1;
            }
        }
        if (!props.isCanary && props.instanceContributorsToFaults !== undefined && props.instanceContributorsToFaults != null) {
            availabilityWidgets.push(new ContributorInsightsWidget_1.ContributorInsightsWidget({
                height: 6,
                width: 24,
                title: "Individual Instance Contributors to Fault Count",
                insightRule: props.instanceContributorsToFaults,
                period: props.availabilityMetricDetails.period,
                legendPosition: aws_cloudwatch_1.LegendPosition.BOTTOM,
                orderStatistic: "Sum",
                accountId: aws_cdk_lib_1.Fn.ref("AWS::AccountId"),
                topContributors: 10
            }));
        }
        return availabilityWidgets;
    }
    static createLatencyWidgets(props, title) {
        let latencyWidgets = [];
        latencyWidgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: title }));
        let rowTracker = 0;
        let keyPrefix = "";
        let latencyMetrics = [];
        let stats = props.latencyMetricDetails.graphedSuccessStatistics !== undefined ? props.latencyMetricDetails.graphedSuccessStatistics : ["p99"];
        let latencySuccessMetrics = stats.map(x => {
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
            return AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: x + " Success Latency",
                metricDetails: props.latencyMetricDetails,
                metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                statistic: x,
                keyPrefix: keyPrefix
            })[0];
        });
        latencyMetrics.concat(latencySuccessMetrics);
        stats = props.latencyMetricDetails.graphedFaultStatistics !== undefined ? props.latencyMetricDetails.graphedFaultStatistics : ["p99"];
        let latencyFaultMetrics = stats.map(x => {
            keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
            return AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: x + " Fault Latency",
                metricDetails: props.latencyMetricDetails,
                metricType: LatencyMetricType_1.LatencyMetricType.FAULT_LATENCY,
                statistic: x,
                keyPrefix: keyPrefix
            })[0];
        });
        latencyMetrics.concat(latencyFaultMetrics);
        if (latencyMetrics.length > 0) {
            latencyWidgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 8,
                width: 24,
                title: aws_cdk_lib_1.Fn.sub("${AWS::Region} Latency"),
                region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                left: latencyMetrics,
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
                        color: aws_cloudwatch_1.Color.RED,
                        label: "High Severity"
                    }
                ]
            }));
        }
        latencyWidgets.push(new aws_cloudwatch_1.AlarmWidget({
            height: 2,
            width: 24,
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            alarm: props.regionalEndpointLatencyAlarm
        }));
        keyPrefix = "";
        for (let i = 0; i < props.availabilityZoneIds.length; i++) {
            let availabilityZoneId = props.availabilityZoneIds[i];
            let latencyMetrics = [];
            let stats = props.latencyMetricDetails.graphedSuccessStatistics !== undefined ? props.latencyMetricDetails.graphedSuccessStatistics : ["p99"];
            let zonalSuccessLatencyMetrics = stats.map(x => {
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                return AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                    label: x + " Success Latency",
                    metricDetails: props.latencyMetricDetails,
                    metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                    statistic: x,
                    availabilityZoneId: availabilityZoneId,
                    keyPrefix: keyPrefix
                })[0];
            });
            latencyMetrics.concat(zonalSuccessLatencyMetrics);
            stats = props.latencyMetricDetails.graphedFaultStatistics !== undefined ? props.latencyMetricDetails.graphedFaultStatistics : ["p99"];
            let zonalFaultLatencyMetrics = stats.map(x => {
                keyPrefix = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
                return AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                    label: x + " Fault Latency",
                    metricDetails: props.latencyMetricDetails,
                    metricType: LatencyMetricType_1.LatencyMetricType.FAULT_LATENCY,
                    statistic: x,
                    availabilityZoneId: availabilityZoneId,
                    keyPrefix: keyPrefix
                })[0];
            });
            latencyMetrics.concat(zonalFaultLatencyMetrics);
            if (latencyMetrics.length > 0) {
                latencyWidgets.push(new aws_cloudwatch_1.GraphWidget({
                    height: 6,
                    width: 8,
                    title: availabilityZoneId + " Latency",
                    region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                    left: latencyMetrics,
                    leftAnnotations: [
                        {
                            value: props.latencyMetricDetails.successAlarmThreshold,
                            visible: true,
                            color: aws_cloudwatch_1.Color.RED,
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
            }
            //We're on the third one for this set, add 3 alarms
            //or if we're at the end, at the necessary amount
            //of alarms, 1, 2, or 3
            if (i % 3 == 2 || i - 1 == props.availabilityZoneIds.length) {
                for (let k = rowTracker; k <= i; k++) {
                    latencyWidgets.push(new aws_cloudwatch_1.AlarmWidget({
                        height: 2,
                        width: 8,
                        region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                        alarm: props.zonalEndpointLatencyAlarms[k]
                    }));
                }
                rowTracker += i + 1;
            }
        }
        if (!props.isCanary && props.instanceContributorsToHighLatency !== undefined && props.instanceContributorsToHighLatency != null) {
            latencyWidgets.push(new ContributorInsightsWidget_1.ContributorInsightsWidget({
                height: 6,
                width: 24,
                title: "Individual Instance Contributors to High Latency",
                insightRule: props.instanceContributorsToHighLatency,
                period: props.latencyMetricDetails.period,
                legendPosition: aws_cloudwatch_1.LegendPosition.BOTTOM,
                orderStatistic: "Sum",
                accountId: aws_cdk_lib_1.Fn.ref("AWS::AccountId"),
                topContributors: 10
            }));
        }
        return latencyWidgets;
    }
    createApplicationLoadBalancerWidgets(props, title, availabilityZoneIds) {
        let albWidgets = [];
        let loadBalancerFullName = props.loadBalancer.loadBalancerFullName;
        albWidgets.push(new aws_cloudwatch_1.TextWidget({ height: 2, width: 24, markdown: title }));
        albWidgets.push(new aws_cloudwatch_1.GraphWidget({
            height: 8,
            width: 24,
            title: aws_cdk_lib_1.Fn.sub("${AWS::Region} Fault Rate"),
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, props.operation.serverSideAvailabilityMetricDetails.period)
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
                    color: aws_cloudwatch_1.Color.RED,
                    label: "High severity"
                }
            ]
        }));
        availabilityZoneIds.forEach((availabilityZoneId) => {
            let availabilityZoneName = this.azMapper.availabilityZoneName(availabilityZoneId);
            albWidgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Fault Rate",
                region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, availabilityZoneName, props.operation.serverSideAvailabilityMetricDetails.period)
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
                        color: aws_cloudwatch_1.Color.RED,
                        label: "High severity"
                    }
                ]
            }));
        });
        albWidgets.push(new aws_cloudwatch_1.GraphWidget({
            height: 8,
            width: 24,
            title: aws_cdk_lib_1.Fn.sub("${AWS::Region} Processed Bytes"),
            region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
            left: [
                AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, props.operation.serverSideAvailabilityMetricDetails.period)
            ],
            leftYAxis: {
                label: "Processed Bytes",
                showUnits: true
            }
        }));
        availabilityZoneIds.forEach(availabilityZoneId => {
            let availabilityZoneName = this.azMapper.availabilityZoneName(availabilityZoneId);
            albWidgets.push(new aws_cloudwatch_1.GraphWidget({
                height: 6,
                width: 8,
                title: availabilityZoneId + " Processed Bytes",
                region: aws_cdk_lib_1.Fn.sub("${AWS::Region}"),
                left: [
                    AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, availabilityZoneName, props.operation.serverSideAvailabilityMetricDetails.period)
                ],
                leftYAxis: {
                    label: "Processed Bytes",
                    showUnits: true
                }
            }));
        });
        return albWidgets;
    }
}
exports.OperationAvailabilityAndLatencyDashboard = OperationAvailabilityAndLatencyDashboard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBRXZDLCtEQUF3SztBQUN4Syw2Q0FBMkM7QUFDM0MsNEZBQXlGO0FBQ3pGLHNFQUFtRTtBQUNuRSxnRkFBNkU7QUFFN0UsMkVBQXdFO0FBR3hFLGdGQUE2RTtBQUc3RTs7R0FFRztBQUNILE1BQWEsd0NBQXlDLFNBQVEsc0JBQVM7SUFTbkUsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvRDtRQUUxRixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksT0FBTyxHQUFnQixFQUFFLENBQUM7UUFFOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLCtDQUFzQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDekQscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCO1NBQ3ZFLENBQUMsQ0FBQztRQUVILElBQUksbUJBQW1CLEdBQWEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RGLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxJQUFJLENBQ1Isd0NBQXdDLENBQUMsbUNBQW1DLENBQ3hFLEtBQUssRUFDTCxnQ0FBZ0MsRUFDaEMsbUJBQW1CLENBQ3RCLENBQ0osQ0FBQztRQUVGLE9BQU8sQ0FBQyxJQUFJLENBQ1Isd0NBQXdDLENBQUMseUJBQXlCLENBQUM7WUFDL0QsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO1lB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QUFHLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ2hDLElBQUksRUFBRTtvQkFDRiw2REFBNkIsQ0FBQyxzREFBc0QsQ0FBQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUFDLE1BQU0sQ0FBQztpQkFDL0w7Z0JBQ0QsU0FBUyxFQUFFO29CQUNQLEtBQUssRUFBRSxpQkFBaUI7b0JBQ3hCLFNBQVMsRUFBRSxJQUFJO2lCQUNsQjthQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBQ0o7QUFuc0JELDRGQW1zQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFByb3BzIH0gZnJvbSBcIi4vcHJvcHMvT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFByb3BzXCI7XG5pbXBvcnQgeyBEYXNoYm9hcmQsIElNZXRyaWMsIFBlcmlvZE92ZXJyaWRlLCBJV2lkZ2V0LCBUZXh0V2lkZ2V0LCBBbGFybVN0YXR1c1dpZGdldCwgR3JhcGhXaWRnZXQsIENvbG9yLCBBbGFybVdpZGdldCwgTGVnZW5kUG9zaXRpb259IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgRHVyYXRpb24sIEZuIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcyB9IGZyb20gXCIuLi9tZXRyaWNzL0F2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzXCI7XG5pbXBvcnQgeyBMYXRlbmN5TWV0cmljVHlwZSB9IGZyb20gXCIuLi91dGlsaXRpZXMvTGF0ZW5jeU1ldHJpY1R5cGVcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0F2YWlsYWJpbGl0eU1ldHJpY1R5cGVcIjtcbmltcG9ydCB7IE9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lXaWRnZXRQcm9wcyB9IGZyb20gXCIuL3Byb3BzL09wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lXaWRnZXRQcm9wc1wiO1xuaW1wb3J0IHsgQ29udHJpYnV0b3JJbnNpZ2h0c1dpZGdldCB9IGZyb20gXCIuL0NvbnRyaWJ1dG9ySW5zaWdodHNXaWRnZXRcIjtcbmltcG9ydCB7IEJhc2VMb2FkQmFsYW5jZXIgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcbmltcG9ydCB7IElPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkIH0gZnJvbSBcIi4vSU9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXIgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0F2YWlsYWJpbGl0eVpvbmVNYXBwZXJcIjtcbmltcG9ydCB7IElBdmFpbGFiaWxpdHlab25lTWFwcGVyIH0gZnJvbSBcIi4uL011bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHlcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9wZXJhdGlvbiBsZXZlbCBhdmFpbGFiaWxpdHkgYW5kIGxhdGVuY3kgZGFzaGJvYXJkXG4gKi9cbmV4cG9ydCBjbGFzcyBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkIGV4dGVuZHMgQ29uc3RydWN0IGltcGxlbWVudHMgSU9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRcbntcbiAgICAvKipcbiAgICAgKiBUaGUgb3BlcmF0aW9uIGxldmVsIGRhc2hib2FyZFxuICAgICAqL1xuICAgIGRhc2hib2FyZDogRGFzaGJvYXJkO1xuXG4gICAgcHJpdmF0ZSBhek1hcHBlcjogSUF2YWlsYWJpbGl0eVpvbmVNYXBwZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFByb3BzKVxuICAgIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBsZXQgd2lkZ2V0czogSVdpZGdldFtdW10gPSBbXTtcblxuICAgICAgICB0aGlzLmF6TWFwcGVyID0gbmV3IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXIodGhpcywgXCJBWk1hcHBlclwiLCB7XG4gICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lTmFtZXM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxldCBhdmFpbGFiaWxpdHlab25lSWRzOiBzdHJpbmdbXSA9IHByb3BzLm9wZXJhdGlvbi5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lcy5tYXAoeCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hek1hcHBlci5hdmFpbGFiaWxpdHlab25lSWQoeCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpZGdldHMucHVzaChcbiAgICAgICAgICAgIE9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQuY3JlYXRlVG9wTGV2ZWxBZ2dyZWdhdGVBbGFybVdpZGdldHMoXG4gICAgICAgICAgICAgICAgcHJvcHMsIFxuICAgICAgICAgICAgICAgIFwiKipUb3AgTGV2ZWwgQWdncmVnYXRlIEFsYXJtcyoqXCIsIFxuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZHNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIHdpZGdldHMucHVzaChcbiAgICAgICAgICAgIE9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQuY3JlYXRlQXZhaWxhYmlsaXR5V2lkZ2V0cyh7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiBwcm9wcy5vcGVyYXRpb24sXG4gICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5TWV0cmljRGV0YWlsczogcHJvcHMub3BlcmF0aW9uLnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxhdGVuY3lNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZHM6IGF2YWlsYWJpbGl0eVpvbmVJZHMsXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHByb3BzLmludGVydmFsLFxuICAgICAgICAgICAgICAgIGlzQ2FuYXJ5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uUGVyaW9kOiBEdXJhdGlvbi5taW51dGVzKDYwKSxcbiAgICAgICAgICAgICAgICB6b25hbEVuZHBvaW50QXZhaWxhYmlsaXR5QWxhcm1zOiBwcm9wcy56b25hbEVuZHBvaW50U2VydmVyQXZhaWxhYmlsaXR5QWxhcm1zLFxuICAgICAgICAgICAgICAgIHpvbmFsRW5kcG9pbnRMYXRlbmN5QWxhcm1zOiBwcm9wcy56b25hbEVuZHBvaW50U2VydmVyTGF0ZW5jeUFsYXJtcyxcbiAgICAgICAgICAgICAgICByZWdpb25hbEVuZHBvaW50QXZhaWxhYmlsaXR5QWxhcm06IHByb3BzLnJlZ2lvbmFsRW5kcG9pbnRTZXJ2ZXJBdmFpbGFiaWxpdHlBbGFybSxcbiAgICAgICAgICAgICAgICByZWdpb25hbEVuZHBvaW50TGF0ZW5jeUFsYXJtOiBwcm9wcy5yZWdpb25hbEVuZHBvaW50U2VydmVyTGF0ZW5jeUFsYXJtLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlQ29udHJpYnV0b3JzVG9GYXVsdHM6IHByb3BzLmluc3RhbmNlQ29udHJpYnV0b3JzVG9GYXVsdHMsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VDb250cmlidXRvcnNUb0hpZ2hMYXRlbmN5OiBwcm9wcy5pbnN0YW5jZUNvbnRyaWJ1dG9yc1RvSGlnaExhdGVuY3lcbiAgICAgICAgICAgIH0sIFwiKipTZXJ2ZXItc2lkZSBBdmFpbGFiaWxpdHkqKlwiKSxcbiAgICAgICAgKTtcblxuICAgICAgICB3aWRnZXRzLnB1c2goXG4gICAgICAgICAgICBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkLmNyZWF0ZUxhdGVuY3lXaWRnZXRzKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246IHByb3BzLm9wZXJhdGlvbixcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkczogYXZhaWxhYmlsaXR5Wm9uZUlkcyxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogcHJvcHMuaW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgaXNDYW5hcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25QZXJpb2Q6IER1cmF0aW9uLm1pbnV0ZXMoNjApLFxuICAgICAgICAgICAgICAgIHpvbmFsRW5kcG9pbnRBdmFpbGFiaWxpdHlBbGFybXM6IHByb3BzLnpvbmFsRW5kcG9pbnRTZXJ2ZXJBdmFpbGFiaWxpdHlBbGFybXMsXG4gICAgICAgICAgICAgICAgem9uYWxFbmRwb2ludExhdGVuY3lBbGFybXM6IHByb3BzLnpvbmFsRW5kcG9pbnRTZXJ2ZXJMYXRlbmN5QWxhcm1zLFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRBdmFpbGFiaWxpdHlBbGFybTogcHJvcHMucmVnaW9uYWxFbmRwb2ludFNlcnZlckF2YWlsYWJpbGl0eUFsYXJtLFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRMYXRlbmN5QWxhcm06IHByb3BzLnJlZ2lvbmFsRW5kcG9pbnRTZXJ2ZXJMYXRlbmN5QWxhcm0sXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VDb250cmlidXRvcnNUb0ZhdWx0czogcHJvcHMuaW5zdGFuY2VDb250cmlidXRvcnNUb0ZhdWx0cyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUNvbnRyaWJ1dG9yc1RvSGlnaExhdGVuY3k6IHByb3BzLmluc3RhbmNlQ29udHJpYnV0b3JzVG9IaWdoTGF0ZW5jeVxuICAgICAgICAgICAgfSwgXCIqKlNlcnZlci1zaWRlIExhdGVuY3kqKlwiKSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAocHJvcHMubG9hZEJhbGFuY2VyICE9PSB1bmRlZmluZWQgJiYgcHJvcHMubG9hZEJhbGFuY2VyICE9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpZGdldHMucHVzaChcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyV2lkZ2V0cyhcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMsIFxuICAgICAgICAgICAgICAgICAgICBcIioqQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlciBNZXRyaWNzKipcIiwgXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZHMsXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSAgICAgICAgICAgICAgICBcblxuICAgICAgICBpZiAocHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMgIT09IHVuZGVmaW5lZCAmJiBwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscyAhPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aWRnZXRzLnB1c2goT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZC5jcmVhdGVBdmFpbGFiaWxpdHlXaWRnZXRzKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246IHByb3BzLm9wZXJhdGlvbixcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscy5jYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxhdGVuY3lNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lcyxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogcHJvcHMuaW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgaXNDYW5hcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25QZXJpb2Q6IER1cmF0aW9uLm1pbnV0ZXMoNjApLFxuICAgICAgICAgICAgICAgIHpvbmFsRW5kcG9pbnRBdmFpbGFiaWxpdHlBbGFybXM6IHByb3BzLnpvbmFsRW5kcG9pbnRTZXJ2ZXJBdmFpbGFiaWxpdHlBbGFybXMsXG4gICAgICAgICAgICAgICAgem9uYWxFbmRwb2ludExhdGVuY3lBbGFybXM6IHByb3BzLnpvbmFsRW5kcG9pbnRTZXJ2ZXJMYXRlbmN5QWxhcm1zLFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRBdmFpbGFiaWxpdHlBbGFybTogcHJvcHMucmVnaW9uYWxFbmRwb2ludFNlcnZlckF2YWlsYWJpbGl0eUFsYXJtLFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRMYXRlbmN5QWxhcm06IHByb3BzLnJlZ2lvbmFsRW5kcG9pbnRTZXJ2ZXJMYXRlbmN5QWxhcm0sXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VDb250cmlidXRvcnNUb0ZhdWx0czogcHJvcHMuaW5zdGFuY2VDb250cmlidXRvcnNUb0ZhdWx0cyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUNvbnRyaWJ1dG9yc1RvSGlnaExhdGVuY3k6IHByb3BzLmluc3RhbmNlQ29udHJpYnV0b3JzVG9IaWdoTGF0ZW5jeVxuXG4gICAgICAgICAgICB9LCBcIioqQ2FuYXJ5IE1lYXN1cmVkIEF2YWlsYWJpbGl0eSoqXCIpKTtcblxuICAgICAgICAgICAgd2lkZ2V0cy5wdXNoKE9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQuY3JlYXRlTGF0ZW5jeVdpZGdldHMoe1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogcHJvcHMub3BlcmF0aW9uLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkczogcHJvcHMub3BlcmF0aW9uLnNlcnZpY2UuYXZhaWxhYmlsaXR5Wm9uZU5hbWVzLFxuICAgICAgICAgICAgICAgIGludGVydmFsOiBwcm9wcy5pbnRlcnZhbCxcbiAgICAgICAgICAgICAgICBpc0NhbmFyeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblBlcmlvZDogRHVyYXRpb24ubWludXRlcyg2MCksXG4gICAgICAgICAgICAgICAgem9uYWxFbmRwb2ludEF2YWlsYWJpbGl0eUFsYXJtczogcHJvcHMuem9uYWxFbmRwb2ludFNlcnZlckF2YWlsYWJpbGl0eUFsYXJtcyxcbiAgICAgICAgICAgICAgICB6b25hbEVuZHBvaW50TGF0ZW5jeUFsYXJtczogcHJvcHMuem9uYWxFbmRwb2ludFNlcnZlckxhdGVuY3lBbGFybXMsXG4gICAgICAgICAgICAgICAgcmVnaW9uYWxFbmRwb2ludEF2YWlsYWJpbGl0eUFsYXJtOiBwcm9wcy5yZWdpb25hbEVuZHBvaW50U2VydmVyQXZhaWxhYmlsaXR5QWxhcm0sXG4gICAgICAgICAgICAgICAgcmVnaW9uYWxFbmRwb2ludExhdGVuY3lBbGFybTogcHJvcHMucmVnaW9uYWxFbmRwb2ludFNlcnZlckxhdGVuY3lBbGFybSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUNvbnRyaWJ1dG9yc1RvRmF1bHRzOiBwcm9wcy5pbnN0YW5jZUNvbnRyaWJ1dG9yc1RvRmF1bHRzLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlQ29udHJpYnV0b3JzVG9IaWdoTGF0ZW5jeTogcHJvcHMuaW5zdGFuY2VDb250cmlidXRvcnNUb0hpZ2hMYXRlbmN5XG5cbiAgICAgICAgICAgIH0sIFwiKipDYW5hcnkgTWVhc3VyZWQgTGF0ZW5jeSoqXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGFzaGJvYXJkID0gbmV3IERhc2hib2FyZCh0aGlzLCBwcm9wcy5vcGVyYXRpb24ub3BlcmF0aW9uTmFtZSArIFwiZGFzaGJvYXJkXCIsIHtcbiAgICAgICAgICAgIGRhc2hib2FyZE5hbWU6IHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgKyBGbi5zdWIoXCItb3BlcmF0aW9uLWF2YWlsYWJpbGl0eS1hbmQtbGF0ZW5jeS0ke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgIGRlZmF1bHRJbnRlcnZhbDogcHJvcHMuaW50ZXJ2YWwsXG4gICAgICAgICAgICBwZXJpb2RPdmVycmlkZTogUGVyaW9kT3ZlcnJpZGUuSU5IRVJJVCxcbiAgICAgICAgICAgIHdpZGdldHM6IHdpZGdldHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlVG9wTGV2ZWxBZ2dyZWdhdGVBbGFybVdpZGdldHMocHJvcHM6IE9wZXJhdGlvbkF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmRQcm9wcywgdGl0bGU6IHN0cmluZywgYXZhaWxhYmlsaXR5Wm9uZUlkczogc3RyaW5nW10pXG4gICAge1xuICAgICAgICBsZXQgdG9wTGV2ZWxBZ2dyZWdhdGVBbGFybXM6IElXaWRnZXRbXSA9IFtcbiAgICAgICAgICAgIG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiB0aXRsZSB9KSxcbiAgICAgICAgICAgIG5ldyBBbGFybVN0YXR1c1dpZGdldChcbiAgICAgICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDIsIFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtczogWyBwcm9wcy5yZWdpb25hbEltcGFjdEFsYXJtIF0sXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBwcm9wcy5vcGVyYXRpb24ub3BlcmF0aW9uTmFtZSArIFwiIFJlZ2lvbmFsIEltcGFjdFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXZhaWxhYmlsaXR5Wm9uZUlkcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGF2YWlsYWJpbGl0eVpvbmVJZCA9IGF2YWlsYWJpbGl0eVpvbmVJZHNbaV07XG5cbiAgICAgICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1zLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IEFsYXJtU3RhdHVzV2lkZ2V0KFxuICAgICAgICAgICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiA4LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsYXJtczogWyBwcm9wcy5pc29sYXRlZEFaSW1wYWN0QWxhcm1zW2ldIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgSXNvbGF0ZWQgSW1wYWN0XCIgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1zLnB1c2gobmV3IFRleHRXaWRnZXQoeyBoZWlnaHQ6IDIsIHdpZHRoOiAyNCwgbWFya2Rvd246IFwiKipBWiBDb250cmlidXRvcnMqKlwiIH0pKTtcblxuICAgICAgICBsZXQgem9uYWxTZXJ2ZXJTaWRlSGlnaExhdGVuY3lNZXRyaWNzOiBJTWV0cmljW10gPSBbXTtcbiAgICAgICAgbGV0IHpvbmFsU2VydmVyU2lkZUZhdWx0Q291bnRNZXRyaWNzOiBJTWV0cmljW10gPSBbXTtcblxuICAgICAgICBsZXQgem9uYWxDYW5hcnlIaWdoTGF0ZW5jeU1ldHJpY3M6IElNZXRyaWNbXSA9IFtdO1xuICAgICAgICBsZXQgem9uYWxDYW5hcnlGYXVsdENvdW50TWV0cmljczogSU1ldHJpY1tdID0gW107XG5cbiAgICAgICAgbGV0IGtleVByZWZpeDogc3RyaW5nID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoXCJcIik7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdmFpbGFiaWxpdHlab25lSWRzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcgPSBhdmFpbGFiaWxpdHlab25lSWRzW2ldO1xuXG4gICAgICAgICAgICB6b25hbFNlcnZlclNpZGVIaWdoTGF0ZW5jeU1ldHJpY3MucHVzaChBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBoaWdoIGxhdGVuY3kgcmVzcG9uc2VzXCIsXG4gICAgICAgICAgICAgICAgbWV0cmljVHlwZTogTGF0ZW5jeU1ldHJpY1R5cGUuU1VDQ0VTU19MQVRFTkNZLFxuICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogYFRDKCR7cHJvcHMub3BlcmF0aW9uLnNlcnZlclNpZGVMYXRlbmN5TWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGR9OilgLFxuICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4XG4gICAgICAgICAgICB9KVswXSk7XG5cbiAgICAgICAgICAgIHpvbmFsU2VydmVyU2lkZUZhdWx0Q291bnRNZXRyaWNzLnB1c2goQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgZmF1bHQgY291bnRcIixcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLkZBVUxUX0NPVU5ULFxuICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGlmIChwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzICE9IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgem9uYWxDYW5hcnlIaWdoTGF0ZW5jeU1ldHJpY3MucHVzaChBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgaGlnaCBsYXRlbmN5IHJlc3BvbnNlc1wiLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogYFRDKCR7cHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMuY2FuYXJ5TGF0ZW5jeU1ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkfTopYCxcbiAgICAgICAgICAgICAgICAgICAga2V5UHJlZml4OiBrZXlQcmVmaXhcbiAgICAgICAgICAgICAgICB9KVswXSk7XG5cbiAgICAgICAgICAgICAgICB6b25hbENhbmFyeUZhdWx0Q291bnRNZXRyaWNzLnB1c2goQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogcHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMuY2FuYXJ5QXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIGZhdWx0IGNvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY1R5cGU6IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuRkFVTFRfQ09VTlQsXG4gICAgICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihrZXlQcmVmaXgpO1xuICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1zLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgIGhlaWdodDogNixcbiAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgIHRpdGxlOiBcIlNlcnZlci1zaWRlIEFaIEZhdWx0IENvbnRyaWJ1dG9yc1wiLFxuICAgICAgICAgICAgbGVmdDogem9uYWxTZXJ2ZXJTaWRlRmF1bHRDb3VudE1ldHJpY3NcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmICh6b25hbENhbmFyeUZhdWx0Q291bnRNZXRyaWNzLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRvcExldmVsQWdncmVnYXRlQWxhcm1zLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkNhbmFyeSBBWiBGYXVsdCBDb250cmlidXRvcnNcIixcbiAgICAgICAgICAgICAgICBsZWZ0OiB6b25hbENhbmFyeUZhdWx0Q291bnRNZXRyaWNzXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtcy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICB0aXRsZTogXCJTZXJ2ZXItc2lkZSBIaWdoIExhdGVuY3kgQ29udHJpYnV0b3JzXCIsXG4gICAgICAgICAgICBsZWZ0OiB6b25hbFNlcnZlclNpZGVIaWdoTGF0ZW5jeU1ldHJpY3NcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmICh6b25hbENhbmFyeUhpZ2hMYXRlbmN5TWV0cmljcy5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtcy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJDYW5hcnkgSGlnaCBMYXRlbmN5IENvbnRyaWJ1dG9yc1wiLFxuICAgICAgICAgICAgICAgIGxlZnQ6IHpvbmFsQ2FuYXJ5SGlnaExhdGVuY3lNZXRyaWNzXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtcy5wdXNoKG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiBcIioqVG9wIExldmVsIE1ldHJpY3MqKlwiIH0pKTtcblxuICAgICAgICB0b3BMZXZlbEFnZ3JlZ2F0ZUFsYXJtcy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICB0aXRsZTogRm4uc3ViKFwiJHtBV1M6OlJlZ2lvbn0gVFBTXCIpLFxuICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICAgICAgICBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpYyh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiIHRwc1wiLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY1R5cGU6IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuUkVRVUVTVF9DT1VOVFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLCAgICAgICBcbiAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlRQU1wiLFxuICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXZhaWxhYmlsaXR5Wm9uZUlkcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nID0gYXZhaWxhYmlsaXR5Wm9uZUlkc1tpXTtcblxuICAgICAgICAgICAgdG9wTGV2ZWxBZ2dyZWdhdGVBbGFybXMucHVzaChuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogNixcbiAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgICB0aXRsZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgVFBTXCIsXG4gICAgICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgICAgICAgICAgIEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLmNyZWF0ZVpvbmFsQXZhaWxhYmlsaXR5TWV0cmljKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIHRwc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogcHJvcHMub3BlcmF0aW9uLnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5SRVFVRVNUX0NPVU5UXG4gICAgICAgICAgICAgICAgICAgIH0pICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLCAgICAgICBcbiAgICAgICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiVFBTXCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3dVbml0czogIGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvcExldmVsQWdncmVnYXRlQWxhcm1zOyAgICBcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjcmVhdGVBdmFpbGFiaWxpdHlXaWRnZXRzKHByb3BzOiBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5V2lkZ2V0UHJvcHMsIHRpdGxlOiBzdHJpbmcpIDogSVdpZGdldFtdXG4gICAge1xuICAgICAgICBsZXQgYXZhaWxhYmlsaXR5V2lkZ2V0czogSVdpZGdldFtdID0gW107ICBcbiAgICAgICAgYXZhaWxhYmlsaXR5V2lkZ2V0cy5wdXNoKG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiB0aXRsZSB9KSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgcm93VHJhY2tlcjogbnVtYmVyID0gMDtcbiAgICAgICAgbGV0IGtleVByZWZpeDE6IHN0cmluZyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKFwiXCIpO1xuICAgICAgICBsZXQga2V5UHJlZml4Mjogc3RyaW5nID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4MSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlZ2lvbmFsIGF2YWlsYWJpbGl0eSBhbmQgZmF1bHQgbWV0cmljcyBhbmQgYXZhaWxhYmlsaXR5IGFsYXJtIHdpZGdldHMgICAgXG4gICAgICAgIGF2YWlsYWJpbGl0eVdpZGdldHMucHVzaChuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgdGl0bGU6IEZuLnN1YihcIiR7QVdTOjpSZWdpb259IEF2YWlsYWJpbGl0eVwiKSxcbiAgICAgICAgICAgIHJlZ2lvbjogRm4uc3ViKFwiJHtBV1M6OlJlZ2lvbn1cIiksXG4gICAgICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlUmVnaW9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcIiBhdmFpbGFiaWxpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogcHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5TVUNDRVNTX1JBVEUsXG4gICAgICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4MVxuICAgICAgICAgICAgICAgIH0pICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIiwgICAgICAgXG4gICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICBtYXg6IDEwMCxcbiAgICAgICAgICAgICAgICBtaW46IDk1LFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkF2YWlsYWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZWZ0QW5ub3RhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IENvbG9yLlJFRCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGlnaCBTZXZlcml0eVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJpZ2h0OiBbXG4gICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlUmVnaW9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcIiBmYXVsdCBjb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLkZBVUxUX0NPVU5ULFxuICAgICAgICAgICAgICAgICAgICBrZXlQcmVmaXg6IGtleVByZWZpeDJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJpZ2h0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJGYXVsdCBDb3VudFwiLFxuICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpOyAgICAgXG5cbiAgICAgICAgYXZhaWxhYmlsaXR5V2lkZ2V0cy5wdXNoKG5ldyBBbGFybVdpZGdldCh7IFxuICAgICAgICAgICAgICAgIGhlaWdodDogMiwgXG4gICAgICAgICAgICAgICAgd2lkdGg6IDI0LCBcbiAgICAgICAgICAgICAgICByZWdpb246IEZuLnN1YihcIiR7QVdTOjpSZWdpb259XCIpLFxuICAgICAgICAgICAgICAgIGFsYXJtOiBwcm9wcy5yZWdpb25hbEVuZHBvaW50QXZhaWxhYmlsaXR5QWxhcm1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKSk7IFxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcHMuYXZhaWxhYmlsaXR5Wm9uZUlkcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nID0gcHJvcHMuYXZhaWxhYmlsaXR5Wm9uZUlkc1tpXTtcblxuICAgICAgICAgICAgbGV0IGtleVByZWZpeDE6IHN0cmluZyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKFwiXCIpO1xuICAgICAgICAgICAgbGV0IGtleVByZWZpeDI6IHN0cmluZyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKGtleVByZWZpeDEpO1xuXG4gICAgICAgICAgICBhdmFpbGFiaWxpdHlXaWRnZXRzLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIEF2YWlsYWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogRm4uc3ViKFwiJHtBV1M6OlJlZ2lvbn1cIiksXG4gICAgICAgICAgICAgICAgbGVmdDogW1xuICAgICAgICAgICAgICAgICAgICBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbEF2YWlsYWJpbGl0eU1ldHJpYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBhdmFpbGFiaWxpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHByb3BzLmF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlNVQ0NFU1NfUkFURSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4MVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgICAgICBtYXg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgbWluOiA5NSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiQXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZnRBbm5vdGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IENvbG9yLlJFRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAgXCJIaWdoIFNldmVyaXR5XCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmlnaHQ6IFtcbiAgICAgICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgZmF1bHQgY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHByb3BzLmF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLkZBVUxUX0NPVU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5UHJlZml4OiBrZXlQcmVmaXgyXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByaWdodFlBeGlzOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkZhdWx0IENvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vV2UncmUgb24gdGhlIHRoaXJkIG9uZSBmb3IgdGhpcyBzZXQsIGFkZCAzIGFsYXJtc1xuICAgICAgICAgICAgLy9vciBpZiB3ZSdyZSBhdCB0aGUgZW5kLCBhdCB0aGUgbmVjZXNzYXJ5IGFtb3VudFxuICAgICAgICAgICAgLy9vZiBhbGFybXMsIDEsIDIsIG9yIDNcbiAgICAgICAgICAgIGlmIChpICUgMyA9PSAyIHx8IGkgLSAxID09IHByb3BzLmF2YWlsYWJpbGl0eVpvbmVJZHMubGVuZ3RoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSByb3dUcmFja2VyOyBrIDw9IGkgOyBrKyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlXaWRnZXRzLnB1c2gobmV3IEFsYXJtV2lkZ2V0KHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGFybTogcHJvcHMuem9uYWxFbmRwb2ludEF2YWlsYWJpbGl0eUFsYXJtc1trXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApKTsgXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcm93VHJhY2tlciArPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcHJvcHMuaXNDYW5hcnkgJiYgcHJvcHMuaW5zdGFuY2VDb250cmlidXRvcnNUb0ZhdWx0cyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmluc3RhbmNlQ29udHJpYnV0b3JzVG9GYXVsdHMgIT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5V2lkZ2V0cy5wdXNoKG5ldyBDb250cmlidXRvckluc2lnaHRzV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkluZGl2aWR1YWwgSW5zdGFuY2UgQ29udHJpYnV0b3JzIHRvIEZhdWx0IENvdW50XCIsXG4gICAgICAgICAgICAgICAgaW5zaWdodFJ1bGU6IHByb3BzLmluc3RhbmNlQ29udHJpYnV0b3JzVG9GYXVsdHMsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLnBlcmlvZCxcbiAgICAgICAgICAgICAgICBsZWdlbmRQb3NpdGlvbjogTGVnZW5kUG9zaXRpb24uQk9UVE9NLFxuICAgICAgICAgICAgICAgIG9yZGVyU3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgIGFjY291bnRJZDogRm4ucmVmKFwiQVdTOjpBY2NvdW50SWRcIiksXG4gICAgICAgICAgICAgICAgdG9wQ29udHJpYnV0b3JzOiAxMCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhdmFpbGFiaWxpdHlXaWRnZXRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxhdGVuY3lXaWRnZXRzKHByb3BzOiBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5V2lkZ2V0UHJvcHMsIHRpdGxlOiBzdHJpbmcpIDogSVdpZGdldFtdXG4gICAge1xuICAgICAgICBsZXQgbGF0ZW5jeVdpZGdldHM6IElXaWRnZXRbXSA9IFtdOyAgXG4gICAgICAgIGxhdGVuY3lXaWRnZXRzLnB1c2gobmV3IFRleHRXaWRnZXQoeyBoZWlnaHQ6IDIsIHdpZHRoOiAyNCwgbWFya2Rvd246IHRpdGxlIH0pKTtcbiAgICAgICAgXG4gICAgICAgIGxldCByb3dUcmFja2VyOiBudW1iZXIgPSAwO1xuICAgICAgICBsZXQga2V5UHJlZml4OiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIGxldCBsYXRlbmN5TWV0cmljczogSU1ldHJpY1tdID0gW107XG5cbiAgICAgICAgbGV0IHN0YXRzOiBzdHJpbmdbXSA9IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLmdyYXBoZWRTdWNjZXNzU3RhdGlzdGljcyAhPT0gdW5kZWZpbmVkID8gcHJvcHMubGF0ZW5jeU1ldHJpY0RldGFpbHMuZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzIDogWyBcInA5OVwiIF1cbiAgICAgICAgXG4gICAgICAgIGxldCBsYXRlbmN5U3VjY2Vzc01ldHJpY3M6IElNZXRyaWNbXSA9IHN0YXRzLm1hcCh4ID0+IHtcbiAgICAgICAgICAgIGtleVByZWZpeCA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKGtleVByZWZpeCk7XG4gICAgICAgICAgICByZXR1cm4gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlUmVnaW9uYWxMYXRlbmN5TWV0cmljcyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IHggKyBcIiBTdWNjZXNzIExhdGVuY3lcIixcbiAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBwcm9wcy5sYXRlbmN5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICAgICAgc3RhdGlzdGljOiB4LFxuICAgICAgICAgICAgICAgIGtleVByZWZpeDoga2V5UHJlZml4XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxhdGVuY3lNZXRyaWNzLmNvbmNhdChsYXRlbmN5U3VjY2Vzc01ldHJpY3MpO1xuICAgICAgICBcbiAgICAgICAgc3RhdHMgPSBwcm9wcy5sYXRlbmN5TWV0cmljRGV0YWlscy5ncmFwaGVkRmF1bHRTdGF0aXN0aWNzICE9PSB1bmRlZmluZWQgPyBwcm9wcy5sYXRlbmN5TWV0cmljRGV0YWlscy5ncmFwaGVkRmF1bHRTdGF0aXN0aWNzIDogWyBcInA5OVwiIF1cblxuICAgICAgICBsZXQgbGF0ZW5jeUZhdWx0TWV0cmljczogSU1ldHJpY1tdID0gc3RhdHMubWFwKHggPT4ge1xuICAgICAgICAgICAga2V5UHJlZml4ID0gQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MubmV4dENoYXIoa2V5UHJlZml4KTtcbiAgICAgICAgICAgIHJldHVybiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogeCArIFwiIEZhdWx0IExhdGVuY3lcIixcbiAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBwcm9wcy5sYXRlbmN5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5GQVVMVF9MQVRFTkNZLFxuICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogeCxcbiAgICAgICAgICAgICAgICBrZXlQcmVmaXg6IGtleVByZWZpeFxuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsYXRlbmN5TWV0cmljcy5jb25jYXQobGF0ZW5jeUZhdWx0TWV0cmljcyk7XG4gICAgICAgIFxuXG4gICAgICAgIGlmIChsYXRlbmN5TWV0cmljcy5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBsYXRlbmN5V2lkZ2V0cy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogRm4uc3ViKFwiJHtBV1M6OlJlZ2lvbn0gTGF0ZW5jeVwiKSxcbiAgICAgICAgICAgICAgICByZWdpb246IEZuLnN1YihcIiR7QVdTOjpSZWdpb259XCIpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxhdGVuY3lNZXRyaWNzLFxuICAgICAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgICAgICBtYXg6IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCAqIDEuNSxcbiAgICAgICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJMYXRlbmN5XCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3dVbml0czogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZnRBbm5vdGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcHMubGF0ZW5jeU1ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBDb2xvci5SRUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIaWdoIFNldmVyaXR5XCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhdGVuY3lXaWRnZXRzLnB1c2gobmV3IEFsYXJtV2lkZ2V0KFxuICAgICAgICAgICAgeyBcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDIsIFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNCwgXG4gICAgICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgICAgICBhbGFybTogcHJvcHMucmVnaW9uYWxFbmRwb2ludExhdGVuY3lBbGFybVxuICAgICAgICAgICAgfVxuICAgICAgICApKTtcblxuICAgICAgICBrZXlQcmVmaXggPSBcIlwiO1xuICAgICAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcHMuYXZhaWxhYmlsaXR5Wm9uZUlkcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nID0gcHJvcHMuYXZhaWxhYmlsaXR5Wm9uZUlkc1tpXTtcblxuICAgICAgICAgICAgbGV0IGxhdGVuY3lNZXRyaWNzOiBJTWV0cmljW10gPSBbXTtcblxuICAgICAgICAgICAgbGV0IHN0YXRzOiBzdHJpbmdbXSA9IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLmdyYXBoZWRTdWNjZXNzU3RhdGlzdGljcyAhPT0gdW5kZWZpbmVkID8gcHJvcHMubGF0ZW5jeU1ldHJpY0RldGFpbHMuZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzIDogWyBcInA5OVwiIF1cblxuICAgICAgICAgICAgbGV0IHpvbmFsU3VjY2Vzc0xhdGVuY3lNZXRyaWNzOiBJTWV0cmljW10gPSBzdGF0cy5tYXAoeCA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihrZXlQcmVmaXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHggKyBcIiBTdWNjZXNzIExhdGVuY3lcIixcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogcHJvcHMubGF0ZW5jeU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY1R5cGU6IExhdGVuY3lNZXRyaWNUeXBlLlNVQ0NFU1NfTEFURU5DWSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiB4LFxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAga2V5UHJlZml4OiBrZXlQcmVmaXhcbiAgICAgICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY3MuY29uY2F0KHpvbmFsU3VjY2Vzc0xhdGVuY3lNZXRyaWNzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGF0cyA9IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLmdyYXBoZWRGYXVsdFN0YXRpc3RpY3MgIT09IHVuZGVmaW5lZCA/IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLmdyYXBoZWRGYXVsdFN0YXRpc3RpY3MgOiBbIFwicDk5XCIgXVxuICAgICAgICBcbiAgICAgICAgICAgIGxldCB6b25hbEZhdWx0TGF0ZW5jeU1ldHJpY3M6IElNZXRyaWNbXSA9IHN0YXRzLm1hcCh4ID0+IHtcbiAgICAgICAgICAgICAgICBrZXlQcmVmaXggPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5uZXh0Q2hhcihrZXlQcmVmaXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHggKyBcIiBGYXVsdCBMYXRlbmN5XCIsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5GQVVMVF9MQVRFTkNZLFxuICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWM6IHgsXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICBrZXlQcmVmaXg6IGtleVByZWZpeFxuICAgICAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYXRlbmN5TWV0cmljcy5jb25jYXQoem9uYWxGYXVsdExhdGVuY3lNZXRyaWNzKTtcbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiAobGF0ZW5jeU1ldHJpY3MubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHsgICAgICAgIFxuICAgICAgICAgICAgICAgIGxhdGVuY3lXaWRnZXRzLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIExhdGVuY3lcIixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGF0ZW5jeU1ldHJpY3MsICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZWZ0QW5ub3RhdGlvbnM6IFsgXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb3BzLmxhdGVuY3lNZXRyaWNEZXRhaWxzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBDb2xvci5SRUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGlnaCBTZXZlcml0eVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiBwcm9wcy5sYXRlbmN5TWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGQgKiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJMYXRlbmN5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93VW5pdHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL1dlJ3JlIG9uIHRoZSB0aGlyZCBvbmUgZm9yIHRoaXMgc2V0LCBhZGQgMyBhbGFybXNcbiAgICAgICAgICAgIC8vb3IgaWYgd2UncmUgYXQgdGhlIGVuZCwgYXQgdGhlIG5lY2Vzc2FyeSBhbW91bnRcbiAgICAgICAgICAgIC8vb2YgYWxhcm1zLCAxLCAyLCBvciAzXG4gICAgICAgICAgICBpZiAoaSAlIDMgPT0gMiB8fCBpIC0gMSA9PSBwcm9wcy5hdmFpbGFiaWxpdHlab25lSWRzLmxlbmd0aClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gcm93VHJhY2tlcjsgayA8PSBpIDsgaysrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGF0ZW5jeVdpZGdldHMucHVzaChuZXcgQWxhcm1XaWRnZXQoeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiA4LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IEZuLnN1YihcIiR7QVdTOjpSZWdpb259XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsYXJtOiBwcm9wcy56b25hbEVuZHBvaW50TGF0ZW5jeUFsYXJtc1trXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApKTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJvd1RyYWNrZXIgKz0gaSArIDE7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwcm9wcy5pc0NhbmFyeSAmJiBwcm9wcy5pbnN0YW5jZUNvbnRyaWJ1dG9yc1RvSGlnaExhdGVuY3kgIT09IHVuZGVmaW5lZCAmJiBwcm9wcy5pbnN0YW5jZUNvbnRyaWJ1dG9yc1RvSGlnaExhdGVuY3kgIT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgbGF0ZW5jeVdpZGdldHMucHVzaChuZXcgQ29udHJpYnV0b3JJbnNpZ2h0c1dpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJJbmRpdmlkdWFsIEluc3RhbmNlIENvbnRyaWJ1dG9ycyB0byBIaWdoIExhdGVuY3lcIixcbiAgICAgICAgICAgICAgICBpbnNpZ2h0UnVsZTogcHJvcHMuaW5zdGFuY2VDb250cmlidXRvcnNUb0hpZ2hMYXRlbmN5LFxuICAgICAgICAgICAgICAgIHBlcmlvZDogcHJvcHMubGF0ZW5jeU1ldHJpY0RldGFpbHMucGVyaW9kLFxuICAgICAgICAgICAgICAgIGxlZ2VuZFBvc2l0aW9uOiBMZWdlbmRQb3NpdGlvbi5CT1RUT00sXG4gICAgICAgICAgICAgICAgb3JkZXJTdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICAgICAgYWNjb3VudElkOiBGbi5yZWYoXCJBV1M6OkFjY291bnRJZFwiKSxcbiAgICAgICAgICAgICAgICB0b3BDb250cmlidXRvcnM6IDEwICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhdGVuY3lXaWRnZXRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQXBwbGljYXRpb25Mb2FkQmFsYW5jZXJXaWRnZXRzKHByb3BzOiBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkUHJvcHMsIHRpdGxlOiBzdHJpbmcsIGF2YWlsYWJpbGl0eVpvbmVJZHM6IHN0cmluZ1tdKSA6IElXaWRnZXRbXVxuICAgIHtcbiAgICAgICAgbGV0IGFsYldpZGdldHM6IElXaWRnZXRbXSA9IFtdO1xuICAgICAgICBsZXQgbG9hZEJhbGFuY2VyRnVsbE5hbWU6IHN0cmluZyA9IChwcm9wcy5sb2FkQmFsYW5jZXIgYXMgQmFzZUxvYWRCYWxhbmNlcikubG9hZEJhbGFuY2VyRnVsbE5hbWU7XG5cbiAgICAgICAgYWxiV2lkZ2V0cy5wdXNoKG5ldyBUZXh0V2lkZ2V0KHsgaGVpZ2h0OiAyLCB3aWR0aDogMjQsIG1hcmtkb3duOiB0aXRsZSB9KSlcblxuICAgICAgICBhbGJXaWRnZXRzLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgIGhlaWdodDogOCxcbiAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgIHRpdGxlOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufSBGYXVsdCBSYXRlXCIpLFxuICAgICAgICAgICAgcmVnaW9uOiBGbi5zdWIoXCIke0FXUzo6UmVnaW9ufVwiKSxcbiAgICAgICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICAgICAgICBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyRmF1bHRSYXRlTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lLCBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMucGVyaW9kKVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgIG1heDogMjAsXG4gICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkZhdWx0IFJhdGVcIixcbiAgICAgICAgICAgICAgICBzaG93VW5pdHM6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVmdEFubm90YXRpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IENvbG9yLlJFRCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGlnaCBzZXZlcml0eVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkcy5mb3JFYWNoKChhdmFpbGFiaWxpdHlab25lSWQpID0+IHtcbiAgICAgICAgICAgIGxldCBhdmFpbGFiaWxpdHlab25lTmFtZTogc3RyaW5nID0gdGhpcy5hek1hcHBlci5hdmFpbGFiaWxpdHlab25lTmFtZShhdmFpbGFiaWxpdHlab25lSWQpO1xuXG4gICAgICAgICAgICBhbGJXaWRnZXRzLnB1c2gobmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIEZhdWx0IFJhdGVcIixcbiAgICAgICAgICAgICAgICByZWdpb246IEZuLnN1YihcIiR7QVdTOjpSZWdpb259XCIpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlckZhdWx0UmF0ZU1ldHJpYyhsb2FkQmFsYW5jZXJGdWxsTmFtZSwgYXZhaWxhYmlsaXR5Wm9uZU5hbWUsIHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscy5wZXJpb2QpXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBsZWZ0WUF4aXM6IHtcbiAgICAgICAgICAgICAgICAgICAgbWF4OiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJGYXVsdCBSYXRlXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZnRBbm5vdGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogQ29sb3IuUkVELFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSGlnaCBzZXZlcml0eVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFsYldpZGdldHMucHVzaChuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgdGl0bGU6IEZuLnN1YihcIiR7QVdTOjpSZWdpb259IFByb2Nlc3NlZCBCeXRlc1wiKSxcbiAgICAgICAgICAgIHJlZ2lvbjogRm4uc3ViKFwiJHtBV1M6OlJlZ2lvbn1cIiksXG4gICAgICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlUmVnaW9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlclByb2Nlc3NlZEJ5dGVzTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lLCBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMucGVyaW9kKVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIlByb2Nlc3NlZCBCeXRlc1wiLFxuICAgICAgICAgICAgICAgIHNob3dVbml0czogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkcy5mb3JFYWNoKGF2YWlsYWJpbGl0eVpvbmVJZCA9PiB7XG4gICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZU5hbWU6IHN0cmluZyA9IHRoaXMuYXpNYXBwZXIuYXZhaWxhYmlsaXR5Wm9uZU5hbWUoYXZhaWxhYmlsaXR5Wm9uZUlkKTtcblxuICAgICAgICAgICAgYWxiV2lkZ2V0cy5wdXNoKG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgIHRpdGxlOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBQcm9jZXNzZWQgQnl0ZXNcIixcbiAgICAgICAgICAgICAgICByZWdpb246IEZuLnN1YihcIiR7QVdTOjpSZWdpb259XCIpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlclByb2Nlc3NlZEJ5dGVzTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lLCBhdmFpbGFiaWxpdHlab25lTmFtZSwgcHJvcHMub3BlcmF0aW9uLnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLnBlcmlvZClcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGxlZnRZQXhpczoge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJQcm9jZXNzZWQgQnl0ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgc2hvd1VuaXRzOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYWxiV2lkZ2V0cztcbiAgICB9XG59Il19