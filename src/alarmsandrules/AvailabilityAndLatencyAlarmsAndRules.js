"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityAndLatencyAlarmsAndRules = void 0;
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const AvailabilityAndLatencyMetrics_1 = require("../metrics/AvailabilityAndLatencyMetrics");
const AvailabilityMetricType_1 = require("../utilities/AvailabilityMetricType");
const LatencyMetricType_1 = require("../utilities/LatencyMetricType");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const InsightRuleBody_1 = require("./InsightRuleBody");
/**
 * Class used to create availability and latency alarms and Contributor Insight rules
 */
class AvailabilityAndLatencyAlarmsAndRules {
    /**
     * Creates a zonal availability alarm
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createZonalAvailabilityAlarm(scope, metricDetails, availabilityZoneId, counter, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, metricDetails.operationName + "AZ" + counter + "AvailabilityAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                label: availabilityZoneId + " availability",
                metricDetails: metricDetails,
                metricType: AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE
            })
        });
    }
    /**
     * Creates a zonal latency alarm
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createZonalLatencyAlarm(scope, metricDetails, availabilityZoneId, counter, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, metricDetails.operationName + "AZ" + counter + "LatencyAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                availabilityZoneId: availabilityZoneId,
                label: availabilityZoneId + " " + metricDetails.alarmStatistic + " latency",
                metricDetails: metricDetails,
                metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                statistic: metricDetails.alarmStatistic
            })[0]
        });
    }
    /**
     * Creates a composite alarm when either latency or availability is breached in the Availabiltiy Zone
     * @param scope
     * @param operation
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @param zonalAvailabilityAlarm
     * @param zonalLatencyAlarm
     * @returns
     */
    static createZonalAvailabilityOrLatencyCompositeAlarm(scope, operationName, availabilityZoneId, counter, zonalAvailabilityAlarm, zonalLatencyAlarm, nameSuffix) {
        return new aws_cloudwatch_1.CompositeAlarm(scope, "AZ" + counter + "ZonalImpactAlarm", {
            actionsEnabled: false,
            alarmDescription: availabilityZoneId + " has latency or availability impact. This does not indicate it is an outlier and shows isolated impact.",
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-impact-aggregate-alarm` + nameSuffix,
            alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(zonalAvailabilityAlarm, zonalLatencyAlarm)
        });
    }
    /**
     * An alarm that compares error rate in this AZ to the overall region error based only on metric data
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @param outlierThreshold
     * @returns
     */
    static createZonalFaultRateOutlierAlarm(scope, metricDetails, availabilityZoneId, counter, outlierThreshold, nameSuffix) {
        // TODO: This is creating metrics with the same names
        let zonalFaults = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            metricDetails: metricDetails,
            metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: "a"
        });
        let regionalFaults = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
            metricDetails: metricDetails,
            metricType: AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: "b"
        });
        return new aws_cloudwatch_1.Alarm(scope, "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-majority-errors-impact` + nameSuffix,
            metric: new aws_cloudwatch_1.MathExpression({
                expression: "(m1 / m2)",
                usingMetrics: {
                    "m1": zonalFaults,
                    "m2": regionalFaults
                },
                period: metricDetails.period,
                label: availabilityZoneId + " percent faults"
            }),
            threshold: outlierThreshold,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm
        });
    }
    static createZonalHighLatencyOutlierAlarm(scope, metricDetails, availabilityZoneId, counter, outlierThreshold, nameSuffix) {
        let zonalLatency = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
            availabilityZoneId: availabilityZoneId,
            label: availabilityZoneId + "-" + metricDetails.operationName + "-high-latency-requests",
            metricDetails: metricDetails,
            metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
            keyPrefix: "a"
        })[0];
        let regionalLatency = AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
            label: aws_cdk_lib_1.Fn.ref("AWS::Region") + "-" + metricDetails.operationName + "-high-latency-requests",
            metricDetails: metricDetails,
            metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
            keyPrefix: "b"
        })[0];
        return new aws_cloudwatch_1.Alarm(scope, metricDetails.operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-majority-high-latency-impact` + nameSuffix,
            metric: new aws_cloudwatch_1.MathExpression({
                expression: "(m1 / m2)",
                usingMetrics: {
                    "m1": zonalLatency,
                    "m2": regionalLatency
                },
                period: metricDetails.period,
                label: availabilityZoneId + " percent high latency requests"
            }),
            threshold: outlierThreshold,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm
        });
    }
    /**
     * An insight rule that calculates how many instances are responding to requests in
     * the specified AZ. Only useful for server-side metrics since the canary doesn't record instance id metrics.
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param logGroups
     * @param nameSuffix
     * @param counter
     * @param instanceIdPath
     * @param operationNamePath
     * @param availabilityZoneIdPath
     * @returns
     */
    static createServerSideInstancesHandlingRequestsInThisAZRule(scope, operationName, availabilityZoneId, ruleDetails, counter, nameSuffix) {
        let ruleBody = new InsightRuleBody_1.InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ruleDetails.instanceIdJsonPath],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [availabilityZoneId]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [operationName]
                }
            ]
        };
        return new aws_cloudwatch_1.CfnInsightRule(scope, "AZ" + counter + "InstancesInTheAZRule", {
            ruleName: availabilityZoneId + `-${operationName.toLowerCase()}-instances-in-the-az` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
    /**
     * An insight rule that calculates the instances contributing to errors
     * in this AZ. Only useful for server-side metrics since the canary doesn't record instance id metrics.
     * @param scope
     * @param operation
     * @param availabilityZoneId
     * @param logGroups
     * @param nameSuffix
     * @param counter
     * @param instanceIdPath
     * @param operationNamePath
     * @param availabilityZoneIdPath
     * @param errorMetricPath
     * @returns
     */
    static createServerSideInstanceFaultContributorsInThisAZRule(scope, operationName, availabilityZoneId, ruleDetails, counter, nameSuffix) {
        let ruleBody = new InsightRuleBody_1.InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ruleDetails.instanceIdJsonPath],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [availabilityZoneId]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [operationName]
                },
                {
                    "Match": ruleDetails.faultMetricJsonPath,
                    "GreaterThan": 0
                }
            ]
        };
        return new aws_cloudwatch_1.CfnInsightRule(scope, "AZ" + counter + "InstanceErrorContributionRule", {
            ruleName: availabilityZoneId + `-${operationName.toLowerCase()}-per-instance-faults` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
    /**
     * An insight rule that calculates instances contributing to high latency in this AZ. Only
     * useful for server-side metrics since the canary doesn't record instance id metrics.
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param logGroups
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createServerSideInstanceHighLatencyContributorsInThisAZRule(scope, metricDetails, availabilityZoneId, ruleDetails, counter, nameSuffix) {
        let ruleBody = new InsightRuleBody_1.InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ruleDetails.instanceIdJsonPath],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [availabilityZoneId]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [metricDetails.operationName]
                },
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": metricDetails.successAlarmThreshold
                }
            ]
        };
        return new aws_cloudwatch_1.CfnInsightRule(scope, "AZ" + counter + "LatencyContributorsRule", {
            ruleName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-per-instance-high-latency` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
    /**
     * An alarm that indicates some percentage of the instances in this AZ are producing errors. Only
     * useful for server-side metrics since the canary doesn't record instance id metrics.
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @param outlierThreshold
     * @param instanceFaultRateContributorsInThisAZ
     * @param instancesHandlingRequestsInThisAZ
     * @returns
     */
    static createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(scope, metricDetails, availabilityZoneId, counter, outlierThreshold, instanceFaultRateContributorsInThisAZ, instancesHandlingRequestsInThisAZ, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForErrors", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-multiple-instances-faults` + nameSuffix,
            metric: new aws_cloudwatch_1.MathExpression({
                expression: `INSIGHT_RULE_METRIC(\"${instanceFaultRateContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
                period: metricDetails.period,
            }),
            evaluationPeriods: metricDetails.evaluationPeriods,
            threshold: outlierThreshold,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE
        });
    }
    /**
     * An alarm indicating more than some percentage of instances in this AZ
     * are contributing to high latency. Only useful for server-side metrics since
     * the canary doesn't record instance id metrics.
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @param outlierThreshold
     * @param instanceHighLatencyContributorsInThisAZ
     * @param instancesHandlingRequestsInThisAZ
     * @returns
     */
    static createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(scope, metricDetails, availabilityZoneId, counter, outlierThreshold, instanceHighLatencyContributorsInThisAZ, instancesHandlingRequestsInThisAZ, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForHighLatency", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-multiple-instances-high-latency` + nameSuffix,
            metric: new aws_cloudwatch_1.MathExpression({
                expression: `INSIGHT_RULE_METRIC(\"${instanceHighLatencyContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
                period: metricDetails.period,
            }),
            evaluationPeriods: metricDetails.evaluationPeriods,
            threshold: outlierThreshold,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE
        });
    }
    /**
     * An alarm that indicates this AZ as an outlier
     * for availability or latency. This does not ensure that the errors
     * or latency originate from more than one instance.
     * @param scope
     * @param operation
     * @param availabilityZoneId
     * @param logGroups
     * @param nameSuffix
     * @param counter
     * @param azIsOutlierForFaultsAlarm
     * @param availabilityImpactAlarm
     * @param azIsOutlierForLatencyAlarm
     * @param latencyImpactAlarm
     * @returns
     */
    static createCanaryIsolatedAZImpactAlarm(scope, operationName, availabilityZoneId, counter, azIsOutlierForFaultsAlarm, availabilityImpactAlarm, azIsOutlierForLatencyAlarm, latencyImpactAlarm, nameSuffix) {
        return new aws_cloudwatch_1.CompositeAlarm(scope, operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
            alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm), aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm)),
            actionsEnabled: false
        });
    }
    /**
     * Creates the server side alarm to identify isolated single AZ
     * impact meaning that this one AZ is affected and the others aren't
     * @param scope
     * @param operation
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @param azIsOutlierForFaultsAlarm
     * @param availabilityImpactAlarm
     * @param moreThanOneInstanceContributingToFaults
     * @param azIsOutlierForLatencyAlarm
     * @param latencyImpactAlarm
     * @param moreThanOneInstanceContributingToLatency
     * @returns
     */
    static createServerSideIsolatedAZImpactAlarm(scope, operationName, availabilityZoneId, counter, azIsOutlierForFaultsAlarm, availabilityImpactAlarm, moreThanOneInstanceContributingToFaults, azIsOutlierForLatencyAlarm, latencyImpactAlarm, moreThanOneInstanceContributingToLatency, nameSuffix) {
        return new aws_cloudwatch_1.CompositeAlarm(scope, operationName + "AZ" + counter + "IsolatedImpactAlarm" + nameSuffix, {
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
            alarmRule: aws_cloudwatch_1.AlarmRule.anyOf((moreThanOneInstanceContributingToFaults === undefined || moreThanOneInstanceContributingToFaults == null) ? aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm) : aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm, moreThanOneInstanceContributingToFaults), (moreThanOneInstanceContributingToLatency === undefined || moreThanOneInstanceContributingToLatency == null) ? aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm) : aws_cloudwatch_1.AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm, moreThanOneInstanceContributingToLatency)),
            actionsEnabled: false
        });
    }
    /**
     * Creates an alarm that fires if either the canary or the
     * server side detect single AZ isolated impact
     * @param scope
     * @param operation
     * @param availabilityZoneId
     * @param counter
     * @param serverSideAlarm
     * @param canaryAlarm
     * @returns
     */
    static createAggregateIsolatedAZImpactAlarm(scope, operation, availabilityZoneId, counter, serverSideAlarm, canaryAlarm) {
        return new aws_cloudwatch_1.CompositeAlarm(scope, operation.operationName + "AZ" + counter + "AggregateIsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-aggregate-isolated-impact-alarm`,
            alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(serverSideAlarm, canaryAlarm),
            actionsEnabled: false
        });
    }
    /**
     * Creates a regional availability alarm for the operation
     * @param scope
     * @param metricDetails
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createRegionalAvailabilityAlarm(scope, metricDetails, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, metricDetails.operationName + "RegionalAvailabilityAlarm", {
            alarmName: aws_cdk_lib_1.Fn.ref("AWS::Region") + "-" + metricDetails.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " availability",
                metricDetails: metricDetails,
                metricType: AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE
            })
        });
    }
    /**
     * Creates a regional latency alarm for the operation
     * @param scope
     * @param metricDetails
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createRegionalLatencyAlarm(scope, metricDetails, nameSuffix) {
        return new aws_cloudwatch_1.Alarm(scope, metricDetails.operationName + "RegionalLatencyAlarm", {
            alarmName: aws_cdk_lib_1.Fn.ref("AWS::Region") + "-" + metricDetails.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics_1.AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: aws_cdk_lib_1.Fn.ref("AWS::Region") + " " + metricDetails.alarmStatistic + " latency",
                metricDetails: metricDetails,
                metricType: LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY,
                statistic: metricDetails.alarmStatistic
            })[0]
        });
    }
    /**
     * A composite alarm combining latency and availability alarms for this operation in the region
     * as measured from either the server side or canary
     * @param scope
     * @param operation
     * @param nameSuffix
     * @param regionalAvailabilityAlarm
     * @param regionalLatencyAlarm
     * @returns
     */
    static createRegionalCustomerExperienceAlarm(scope, operationName, nameSuffix, regionalAvailabilityAlarm, regionalLatencyAlarm) {
        return new aws_cloudwatch_1.CompositeAlarm(scope, operationName + "RegionalCustomerExperienceAlarm", {
            compositeAlarmName: aws_cdk_lib_1.Fn.ref("AWS::Region") + "-" + operationName.toLowerCase() + "-customer-experience-imact" + nameSuffix,
            alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(regionalAvailabilityAlarm, regionalLatencyAlarm)
        });
    }
    static createRegionalInstanceContributorsToHighLatency(scope, metricDetails, ruleDetails) {
        let ruleBody = new InsightRuleBody_1.InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ruleDetails.instanceIdJsonPath],
            filters: [
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": metricDetails.successAlarmThreshold
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [metricDetails.operationName]
                }
            ]
        };
        return new aws_cloudwatch_1.CfnInsightRule(scope, "RegionPerInstanceHighLatencyRule", {
            ruleName: aws_cdk_lib_1.Fn.ref("AWS::Region") + `-${metricDetails.operationName.toLowerCase()}-per-instance-high-latency-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
    static createRegionalInstanceContributorsToFaults(scope, metricDetails, ruleDetails) {
        let ruleBody = new InsightRuleBody_1.InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ruleDetails.instanceIdJsonPath],
            filters: [
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": 0
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [metricDetails.operationName]
                }
            ]
        };
        return new aws_cloudwatch_1.CfnInsightRule(scope, "RegionPerInstanceErrorRule", {
            ruleName: aws_cdk_lib_1.Fn.ref("AWS::Region") + `-${metricDetails.operationName.toLowerCase()}-per-instance-faults-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
}
exports.AvailabilityAndLatencyAlarmsAndRules = AvailabilityAndLatencyAlarmsAndRules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeUFsYXJtc0FuZFJ1bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeUFsYXJtc0FuZFJ1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFxSztBQUNySyw0RkFBeUY7QUFDekYsZ0ZBQTZFO0FBQzdFLHNFQUFtRTtBQUNuRSw2Q0FBaUM7QUFDakMsdURBQTZFO0FBSzdFOztHQUVHO0FBQ0gsTUFBYSxvQ0FBb0M7SUFFN0M7Ozs7Ozs7O09BUUc7SUFDSCxNQUFNLENBQUMsNEJBQTRCLENBQUMsS0FBZ0IsRUFBRSxhQUFzQyxFQUFFLGtCQUEwQixFQUFFLE9BQWUsRUFBRSxVQUFtQjtRQUUxSixPQUFPLElBQUksc0JBQUssQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLG1CQUFtQixFQUFFO1lBQ3hGLFNBQVMsRUFBRSxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxlQUFlLEdBQUcsVUFBVTtZQUM5RyxpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCO1lBQ2xELGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsa0JBQWtCLEVBQUUsbUNBQWtCLENBQUMsbUJBQW1CO1lBQzFELFNBQVMsRUFBRSxhQUFhLENBQUMscUJBQXFCO1lBQzlDLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGdCQUFnQixFQUFFLGlDQUFnQixDQUFDLE1BQU07WUFDekMsTUFBTSxFQUFFLDZEQUE2QixDQUFDLDZCQUE2QixDQUFDO2dCQUNoRSxrQkFBa0IsRUFBRSxrQkFBa0I7Z0JBQ3RDLEtBQUssRUFBRSxrQkFBa0IsR0FBRyxlQUFlO2dCQUMzQyxhQUFhLEVBQUUsYUFBYTtnQkFDNUIsVUFBVSxFQUFFLCtDQUFzQixDQUFDLFlBQVk7YUFDbEQsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFnQixFQUFFLGFBQXNDLEVBQUUsa0JBQTBCLEVBQUUsT0FBZSxFQUFFLFVBQW1CO1FBRXJKLE9BQU8sSUFBSSxzQkFBSyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxPQUFPLEdBQUcsY0FBYyxFQUFFO1lBQ25GLFNBQVMsRUFBRSxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxrQkFBa0IsR0FBRyxVQUFVO1lBQ2pILGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLGlCQUFpQjtZQUNsRCxrQkFBa0IsRUFBRSxtQ0FBa0IsQ0FBQyxzQkFBc0I7WUFDN0QsU0FBUyxFQUFFLGFBQWEsQ0FBQyxxQkFBcUI7WUFDOUMsY0FBYyxFQUFFLEtBQUs7WUFDckIsZ0JBQWdCLEVBQUUsaUNBQWdCLENBQUMsTUFBTTtZQUN6QyxNQUFNLEVBQUUsNkRBQTZCLENBQUMseUJBQXlCLENBQUM7Z0JBQzVELGtCQUFrQixFQUFFLGtCQUFrQjtnQkFDdEMsS0FBSyxFQUFFLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsY0FBYyxHQUFHLFVBQVU7Z0JBQzNFLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixVQUFVLEVBQUUscUNBQWlCLENBQUMsZUFBZTtnQkFDN0MsU0FBUyxFQUFFLGFBQWEsQ0FBQyxjQUFjO2FBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILE1BQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxLQUFnQixFQUFFLGFBQXFCLEVBQUUsa0JBQTBCLEVBQUUsT0FBZSxFQUFFLHNCQUE4QixFQUFFLGlCQUF5QixFQUFFLFVBQW1CO1FBRXROLE9BQU8sSUFBSSwrQkFBYyxDQUFDLEtBQUssRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLGtCQUFrQixFQUFFO1lBQ2xFLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGdCQUFnQixFQUFFLGtCQUFrQixHQUFHLHlHQUF5RztZQUNoSixrQkFBa0IsRUFBRSxrQkFBa0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUseUJBQXlCLEdBQUcsVUFBVTtZQUM5RyxTQUFTLEVBQUUsMEJBQVMsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLENBQUM7U0FDeEUsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFnQixFQUFFLGFBQXNDLEVBQUUsa0JBQTBCLEVBQUUsT0FBZSxFQUFFLGdCQUF3QixFQUFFLFVBQW1CO1FBRXhMLHFEQUFxRDtRQUNyRCxJQUFJLFdBQVcsR0FBWSw2REFBNkIsQ0FBQyw2QkFBNkIsQ0FBQztZQUNuRixrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsYUFBYSxFQUFFLGFBQWE7WUFDNUIsVUFBVSxFQUFFLCtDQUFzQixDQUFDLFdBQVc7WUFDOUMsU0FBUyxFQUFFLEdBQUc7U0FDakIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxjQUFjLEdBQVksNkRBQTZCLENBQUMsZ0NBQWdDLENBQUM7WUFDekYsYUFBYSxFQUFFLGFBQWE7WUFDNUIsVUFBVSxFQUFFLCtDQUFzQixDQUFDLFdBQVc7WUFDOUMsU0FBUyxFQUFFLEdBQUc7U0FDakIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLHNCQUFLLENBQUMsS0FBSyxFQUFFLElBQUksR0FBRyxPQUFPLEdBQUcscUJBQXFCLEVBQUU7WUFDNUQsU0FBUyxFQUFFLGtCQUFrQixHQUFHLElBQUksYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUseUJBQXlCLEdBQUcsVUFBVTtZQUNuSCxNQUFNLEVBQUUsSUFBSSwrQkFBYyxDQUFDO2dCQUN2QixVQUFVLEVBQUUsV0FBVztnQkFDdkIsWUFBWSxFQUFFO29CQUNWLElBQUksRUFBRSxXQUFXO29CQUNqQixJQUFJLEVBQUUsY0FBYztpQkFDdkI7Z0JBQ0QsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO2dCQUM1QixLQUFLLEVBQUUsa0JBQWtCLEdBQUcsaUJBQWlCO2FBQ2hELENBQUM7WUFDRixTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLGtCQUFrQixFQUFFLG1DQUFrQixDQUFDLGtDQUFrQztZQUN6RSxnQkFBZ0IsRUFBRSxpQ0FBZ0IsQ0FBQyxNQUFNO1lBQ3pDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLGlCQUFpQjtTQUNyRCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLGtDQUFrQyxDQUNyQyxLQUFnQixFQUNoQixhQUFzQyxFQUN0QyxrQkFBMEIsRUFDMUIsT0FBZSxFQUNmLGdCQUF3QixFQUN4QixVQUFtQjtRQUduQixJQUFJLFlBQVksR0FBWSw2REFBNkIsQ0FBQyx5QkFBeUIsQ0FBQztZQUNoRixrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsS0FBSyxFQUFFLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsYUFBYSxHQUFHLHdCQUF3QjtZQUN4RixhQUFhLEVBQUUsYUFBYTtZQUM1QixVQUFVLEVBQUUscUNBQWlCLENBQUMsZUFBZTtZQUM3QyxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUMscUJBQXFCLElBQUk7WUFDeEQsU0FBUyxFQUFFLEdBQUc7U0FDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sSUFBSSxlQUFlLEdBQVksNkRBQTZCLENBQUMsNEJBQTRCLENBQUM7WUFDdEYsS0FBSyxFQUFFLGdCQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsYUFBYSxHQUFHLHdCQUF3QjtZQUMzRixhQUFhLEVBQUUsYUFBYTtZQUM1QixVQUFVLEVBQUUscUNBQWlCLENBQUMsZUFBZTtZQUM3QyxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUMscUJBQXFCLElBQUk7WUFDeEQsU0FBUyxFQUFFLEdBQUc7U0FDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRU4sT0FBTyxJQUFJLHNCQUFLLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxxQkFBcUIsRUFBRTtZQUMxRixTQUFTLEVBQUUsa0JBQWtCLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSwrQkFBK0IsR0FBRyxVQUFVO1lBQ3pILE1BQU0sRUFBRSxJQUFJLCtCQUFjLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxXQUFXO2dCQUN2QixZQUFZLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLElBQUksRUFBRSxlQUFlO2lCQUN4QjtnQkFDRCxNQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU07Z0JBQzVCLEtBQUssRUFBRSxrQkFBa0IsR0FBRyxnQ0FBZ0M7YUFDL0QsQ0FBQztZQUNGLFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0Isa0JBQWtCLEVBQUUsbUNBQWtCLENBQUMsa0NBQWtDO1lBQ3pFLGdCQUFnQixFQUFFLGlDQUFnQixDQUFDLE1BQU07WUFDekMsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLGlCQUFpQjtZQUNsRCxpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCO1NBQ3JELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsTUFBTSxDQUFDLHFEQUFxRCxDQUN4RCxLQUFnQixFQUNoQixhQUFxQixFQUNyQixrQkFBMEIsRUFDMUIsV0FBMkMsRUFDM0MsT0FBZSxFQUNmLFVBQW1CO1FBRW5CLElBQUksUUFBUSxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEUsUUFBUSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFFL0IsUUFBUSxDQUFDLFlBQVksR0FBRztZQUNwQixJQUFJLEVBQUUsQ0FBRSxXQUFXLENBQUMsa0JBQWtCLENBQUU7WUFDeEMsT0FBTyxFQUFFO2dCQUNMO29CQUNJLE9BQU8sRUFBRSxXQUFXLENBQUMsMEJBQTBCO29CQUMvQyxJQUFJLEVBQUUsQ0FBRSxrQkFBa0IsQ0FBRTtpQkFDL0I7Z0JBQ0Q7b0JBQ0ksT0FBTyxFQUFFLFdBQVcsQ0FBQyxxQkFBcUI7b0JBQzFDLElBQUksRUFBRSxDQUFFLGFBQWEsQ0FBRTtpQkFDMUI7YUFDSjtTQUNrQyxDQUFDO1FBRXhDLE9BQU8sSUFBSSwrQkFBYyxDQUFDLEtBQUssRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLHNCQUFzQixFQUFFO1lBQ3RFLFFBQVEsRUFBRSxrQkFBa0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLEdBQUcsVUFBVTtZQUNqRyxTQUFTLEVBQUUsU0FBUztZQUNwQixRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRTtTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFDSCxNQUFNLENBQUMscURBQXFELENBQ3hELEtBQWdCLEVBQ2hCLGFBQXFCLEVBQ3JCLGtCQUEwQixFQUMxQixXQUEyQyxFQUMzQyxPQUFlLEVBQ2YsVUFBbUI7UUFHbkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxpQ0FBZSxFQUFFLENBQUM7UUFDckMsUUFBUSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4RSxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUMvQixRQUFRLENBQUMsWUFBWSxHQUFHO1lBQ3BCLElBQUksRUFBRSxDQUFFLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBRTtZQUN4QyxPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksT0FBTyxFQUFFLFdBQVcsQ0FBQywwQkFBMEI7b0JBQy9DLElBQUksRUFBRSxDQUFFLGtCQUFrQixDQUFFO2lCQUMvQjtnQkFDRDtvQkFDSSxPQUFPLEVBQUUsV0FBVyxDQUFDLHFCQUFxQjtvQkFDMUMsSUFBSSxFQUFFLENBQUUsYUFBYSxDQUFFO2lCQUMxQjtnQkFDRDtvQkFDSSxPQUFPLEVBQUUsV0FBVyxDQUFDLG1CQUFtQjtvQkFDeEMsYUFBYSxFQUFFLENBQUM7aUJBQ25CO2FBQ0o7U0FDa0MsQ0FBQztRQUV4QyxPQUFPLElBQUksK0JBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLE9BQU8sR0FBRywrQkFBK0IsRUFBRTtZQUMvRSxRQUFRLEVBQUUsa0JBQWtCLEdBQUcsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLHNCQUFzQixHQUFHLFVBQVU7WUFDakcsU0FBUyxFQUFFLFNBQVM7WUFDcEIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUU7U0FDOUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxNQUFNLENBQUMsMkRBQTJELENBQzlELEtBQWdCLEVBQ2hCLGFBQXNDLEVBQ3RDLGtCQUEwQixFQUMxQixXQUEyQyxFQUMzQyxPQUFlLEVBQ2YsVUFBbUI7UUFHbkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxpQ0FBZSxFQUFFLENBQUM7UUFDckMsUUFBUSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4RSxRQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUMvQixRQUFRLENBQUMsWUFBWSxHQUFHO1lBQ3BCLElBQUksRUFBRSxDQUFFLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBRTtZQUN4QyxPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksT0FBTyxFQUFFLFdBQVcsQ0FBQywwQkFBMEI7b0JBQy9DLElBQUksRUFBRSxDQUFFLGtCQUFrQixDQUFFO2lCQUMvQjtnQkFDRDtvQkFDSSxPQUFPLEVBQUUsV0FBVyxDQUFDLHFCQUFxQjtvQkFDMUMsSUFBSSxFQUFFLENBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBRTtpQkFDeEM7Z0JBQ0Q7b0JBQ0ksT0FBTyxFQUFFLFdBQVcsQ0FBQyw0QkFBNEI7b0JBQ2pELGFBQWEsRUFBRSxhQUFhLENBQUMscUJBQXFCO2lCQUNyRDthQUNKO1NBQ2tDLENBQUM7UUFFeEMsT0FBTyxJQUFJLCtCQUFjLENBQUMsS0FBSyxFQUFFLElBQUksR0FBRyxPQUFPLEdBQUcseUJBQXlCLEVBQUU7WUFDekUsUUFBUSxFQUFFLGtCQUFrQixHQUFHLElBQUksYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsNEJBQTRCLEdBQUcsVUFBVTtZQUNySCxTQUFTLEVBQUUsU0FBUztZQUNwQixRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRTtTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsTUFBTSxDQUFDLDREQUE0RCxDQUMvRCxLQUFnQixFQUNoQixhQUFzQyxFQUN0QyxrQkFBMEIsRUFDMUIsT0FBZSxFQUNmLGdCQUF3QixFQUN4QixxQ0FBcUQsRUFDckQsaUNBQWlELEVBQ2pELFVBQW1CO1FBR25CLE9BQU8sSUFBSSxzQkFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLDJCQUEyQixFQUFFO1lBQ2xFLFNBQVMsRUFBRSxrQkFBa0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLDRCQUE0QixHQUFHLFVBQVU7WUFDdEgsTUFBTSxFQUFFLElBQUksK0JBQWMsQ0FBQztnQkFDdkIsVUFBVSxFQUFFLHlCQUF5QixxQ0FBcUMsQ0FBQyxZQUFZLHVEQUF1RCxpQ0FBaUMsQ0FBQyxZQUFZLDZCQUE2QjtnQkFDek4sTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO2FBQy9CLENBQUM7WUFDRixpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCO1lBQ2xELFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0Isa0JBQWtCLEVBQUUsbUNBQWtCLENBQUMsa0NBQWtDO1lBQ3pFLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsY0FBYyxFQUFFLEtBQUs7WUFDckIsZ0JBQWdCLEVBQUUsaUNBQWdCLENBQUMsTUFBTTtTQUM1QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILE1BQU0sQ0FBQyxpRUFBaUUsQ0FDcEUsS0FBZ0IsRUFDaEIsYUFBc0MsRUFDdEMsa0JBQTBCLEVBQzFCLE9BQWUsRUFDZixnQkFBd0IsRUFDeEIsdUNBQXVELEVBQ3ZELGlDQUFpRCxFQUNqRCxVQUFtQjtRQUduQixPQUFPLElBQUksc0JBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLE9BQU8sR0FBRyxnQ0FBZ0MsRUFBRTtZQUN2RSxTQUFTLEVBQUUsa0JBQWtCLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxrQ0FBa0MsR0FBRyxVQUFVO1lBQzVILE1BQU0sRUFBRSxJQUFJLCtCQUFjLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSx5QkFBeUIsdUNBQXVDLENBQUMsWUFBWSx1REFBdUQsaUNBQWlDLENBQUMsWUFBWSw2QkFBNkI7Z0JBQzNOLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTTthQUMvQixDQUFDO1lBQ0YsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLGlCQUFpQjtZQUNsRCxTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLGtCQUFrQixFQUFFLG1DQUFrQixDQUFDLGtDQUFrQztZQUN6RSxpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCO1lBQ2xELGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGdCQUFnQixFQUFFLGlDQUFnQixDQUFDLE1BQU07U0FDNUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7T0FlRztJQUNILE1BQU0sQ0FBQyxpQ0FBaUMsQ0FDcEMsS0FBZ0IsRUFDaEIsYUFBcUIsRUFDckIsa0JBQTBCLEVBQzFCLE9BQWUsRUFDZix5QkFBaUMsRUFDakMsdUJBQStCLEVBQy9CLDBCQUFrQyxFQUNsQyxrQkFBMEIsRUFDMUIsVUFBbUI7UUFHbkIsT0FBTyxJQUFJLCtCQUFjLENBQUMsS0FBSyxFQUFFLGFBQWEsR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLHFCQUFxQixFQUFFO1lBQ3JGLGtCQUFrQixFQUFFLGtCQUFrQixHQUFHLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSx3QkFBd0IsR0FBRyxVQUFVO1lBQzdHLFNBQVMsRUFBRSwwQkFBUyxDQUFDLEtBQUssQ0FDdEIsMEJBQVMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsdUJBQXVCLENBQUMsRUFDbkUsMEJBQVMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsa0JBQWtCLENBQUMsQ0FDbEU7WUFDRCxjQUFjLEVBQUUsS0FBSztTQUN4QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsTUFBTSxDQUFDLHFDQUFxQyxDQUN4QyxLQUFnQixFQUNoQixhQUFxQixFQUNyQixrQkFBMEIsRUFDMUIsT0FBZSxFQUNmLHlCQUFpQyxFQUNqQyx1QkFBK0IsRUFDL0IsdUNBQStDLEVBQy9DLDBCQUFrQyxFQUNsQyxrQkFBMEIsRUFDMUIsd0NBQWdELEVBQ2hELFVBQW1CO1FBR25CLE9BQU8sSUFBSSwrQkFBYyxDQUFDLEtBQUssRUFBRSxhQUFhLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxxQkFBcUIsR0FBRyxVQUFVLEVBQUU7WUFDbEcsa0JBQWtCLEVBQUUsa0JBQWtCLEdBQUcsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLHdCQUF3QixHQUFHLFVBQVU7WUFDN0csU0FBUyxFQUFFLDBCQUFTLENBQUMsS0FBSyxDQUN0QixDQUFDLHVDQUF1QyxLQUFLLFNBQVMsSUFBSSx1Q0FBdUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQVMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQVMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsdUJBQXVCLEVBQUUsdUNBQXVDLENBQUMsRUFDL1IsQ0FBQyx3Q0FBd0MsS0FBSyxTQUFTLElBQUksd0NBQXdDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLGtCQUFrQixFQUFFLHdDQUF3QyxDQUFDLENBQzdSO1lBQ0QsY0FBYyxFQUFFLEtBQUs7U0FDeEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxNQUFNLENBQUMsb0NBQW9DLENBQ3ZDLEtBQWdCLEVBQ2hCLFNBQXFCLEVBQ3JCLGtCQUEwQixFQUMxQixPQUFlLEVBQ2YsZUFBdUIsRUFDdkIsV0FBbUI7UUFHbkIsT0FBTyxJQUFJLCtCQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsRUFBRTtZQUN4RyxrQkFBa0IsRUFBRSxrQkFBa0IsR0FBRyxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLGtDQUFrQztZQUNwSCxTQUFTLEVBQUUsMEJBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQztZQUN4RCxjQUFjLEVBQUUsS0FBSztTQUN4QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxLQUFnQixFQUFFLGFBQXNDLEVBQUUsVUFBa0I7UUFFL0csT0FBTyxJQUFJLHNCQUFLLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEdBQUcsMkJBQTJCLEVBQUU7WUFDL0UsU0FBUyxFQUFFLGdCQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxHQUFHLGVBQWUsR0FBRyxVQUFVO1lBQ2pILGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLGlCQUFpQjtZQUNsRCxrQkFBa0IsRUFBRSxtQ0FBa0IsQ0FBQyxtQkFBbUI7WUFDMUQsU0FBUyxFQUFFLGFBQWEsQ0FBQyxxQkFBcUI7WUFDOUMsY0FBYyxFQUFFLEtBQUs7WUFDckIsZ0JBQWdCLEVBQUUsaUNBQWdCLENBQUMsTUFBTTtZQUN6QyxNQUFNLEVBQUUsNkRBQTZCLENBQUMsZ0NBQWdDLENBQUM7Z0JBQ25FLEtBQUssRUFBRSxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxlQUFlO2dCQUM5QyxhQUFhLEVBQUUsYUFBYTtnQkFDNUIsVUFBVSxFQUFFLCtDQUFzQixDQUFDLFlBQVk7YUFDbEQsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLDBCQUEwQixDQUFDLEtBQWdCLEVBQUUsYUFBc0MsRUFBRSxVQUFrQjtRQUUxRyxPQUFPLElBQUksc0JBQUssQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsRUFBRTtZQUMxRSxTQUFTLEVBQUUsZ0JBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEdBQUcsa0JBQWtCLEdBQUcsVUFBVTtZQUNwSCxpQkFBaUIsRUFBRSxhQUFhLENBQUMsaUJBQWlCO1lBQ2xELGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUI7WUFDbEQsa0JBQWtCLEVBQUUsbUNBQWtCLENBQUMsc0JBQXNCO1lBQzdELFNBQVMsRUFBRSxhQUFhLENBQUMscUJBQXFCO1lBQzlDLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGdCQUFnQixFQUFFLGlDQUFnQixDQUFDLE1BQU07WUFDekMsTUFBTSxFQUFFLDZEQUE2QixDQUFDLDRCQUE0QixDQUFDO2dCQUMvRCxLQUFLLEVBQUUsZ0JBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxjQUFjLEdBQUcsVUFBVTtnQkFDOUUsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLFVBQVUsRUFBRSxxQ0FBaUIsQ0FBQyxlQUFlO2dCQUM3QyxTQUFTLEVBQUUsYUFBYSxDQUFDLGNBQWM7YUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNSLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxNQUFNLENBQUMscUNBQXFDLENBQUMsS0FBZ0IsRUFBRSxhQUFxQixFQUFFLFVBQWtCLEVBQUUseUJBQWlDLEVBQUUsb0JBQTRCO1FBRXJLLE9BQU8sSUFBSSwrQkFBYyxDQUFDLEtBQUssRUFBRSxhQUFhLEdBQUcsaUNBQWlDLEVBQUc7WUFDakYsa0JBQWtCLEVBQUUsZ0JBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQUUsR0FBRyw0QkFBNEIsR0FBRyxVQUFVO1lBQ3pILFNBQVMsRUFBRSwwQkFBUyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxvQkFBb0IsQ0FBQztTQUM5RSxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLCtDQUErQyxDQUNsRCxLQUFnQixFQUNoQixhQUFzQyxFQUN0QyxXQUEyQztRQUczQyxJQUFJLFFBQVEsR0FBRyxJQUFJLGlDQUFlLEVBQUUsQ0FBQztRQUNyQyxRQUFRLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLFFBQVEsQ0FBQyxZQUFZLEdBQUc7WUFDcEIsSUFBSSxFQUFFLENBQUUsV0FBVyxDQUFDLGtCQUFrQixDQUFFO1lBQ3hDLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxPQUFPLEVBQUUsV0FBVyxDQUFDLDRCQUE0QjtvQkFDakQsYUFBYSxFQUFFLGFBQWEsQ0FBQyxxQkFBcUI7aUJBQ3JEO2dCQUNEO29CQUNJLE9BQU8sRUFBRSxXQUFXLENBQUMscUJBQXFCO29CQUMxQyxJQUFJLEVBQUUsQ0FBRSxhQUFhLENBQUMsYUFBYSxDQUFFO2lCQUN4QzthQUNKO1NBQ2tDLENBQUM7UUFFeEMsT0FBTyxJQUFJLCtCQUFjLENBQUMsS0FBSyxFQUFFLGtDQUFrQyxFQUFFO1lBQ2pFLFFBQVEsRUFBRSxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLG1DQUFtQztZQUNsSCxTQUFTLEVBQUUsU0FBUztZQUNwQixRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRTtTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLDBDQUEwQyxDQUM3QyxLQUFnQixFQUNoQixhQUFzQyxFQUN0QyxXQUEyQztRQUczQyxJQUFJLFFBQVEsR0FBRyxJQUFJLGlDQUFlLEVBQUUsQ0FBQztRQUNyQyxRQUFRLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQy9CLFFBQVEsQ0FBQyxZQUFZLEdBQUc7WUFDcEIsSUFBSSxFQUFFLENBQUUsV0FBVyxDQUFDLGtCQUFrQixDQUFFO1lBQ3hDLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxPQUFPLEVBQUUsV0FBVyxDQUFDLDRCQUE0QjtvQkFDakQsYUFBYSxFQUFFLENBQUM7aUJBQ25CO2dCQUNEO29CQUNJLE9BQU8sRUFBRSxXQUFXLENBQUMscUJBQXFCO29CQUMxQyxJQUFJLEVBQUUsQ0FBRSxhQUFhLENBQUMsYUFBYSxDQUFFO2lCQUN4QzthQUNKO1NBQ2tDLENBQUM7UUFFeEMsT0FBTyxJQUFJLCtCQUFjLENBQUMsS0FBSyxFQUFFLDRCQUE0QixFQUFFO1lBQzNELFFBQVEsRUFBRSxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLDZCQUE2QjtZQUM1RyxTQUFTLEVBQUUsU0FBUztZQUNwQixRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRTtTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF2bkJELG9GQXVuQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgSUFsYXJtLCBBbGFybSwgSU1ldHJpYywgQ29tcG9zaXRlQWxhcm0sIEFsYXJtUnVsZSwgTWF0aEV4cHJlc3Npb24sIENmbkluc2lnaHRSdWxlLCBDb21wYXJpc29uT3BlcmF0b3IsIFRyZWF0TWlzc2luZ0RhdGEgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2hcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzIH0gZnJvbSBcIi4uL21ldHJpY3MvQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3NcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0F2YWlsYWJpbGl0eU1ldHJpY1R5cGVcIjtcbmltcG9ydCB7IExhdGVuY3lNZXRyaWNUeXBlIH0gZnJvbSBcIi4uL3V0aWxpdGllcy9MYXRlbmN5TWV0cmljVHlwZVwiO1xuaW1wb3J0IHsgRm4gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IElDb250cmlidXRpb25EZWZpbml0aW9uLCBJbnNpZ2h0UnVsZUJvZHkgfSBmcm9tIFwiLi9JbnNpZ2h0UnVsZUJvZHlcIjtcbmltcG9ydCB7IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzIH0gZnJvbSBcIi4uL3NlcnZpY2VzL0lPcGVyYXRpb25NZXRyaWNEZXRhaWxzXCI7XG5pbXBvcnQgeyBJT3BlcmF0aW9uIH0gZnJvbSBcIi4uL3NlcnZpY2VzL0lPcGVyYXRpb25cIjtcbmltcG9ydCB7IElDb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlscyB9IGZyb20gXCIuLi9zZXJ2aWNlcy9JQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHNcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIHRvIGNyZWF0ZSBhdmFpbGFiaWxpdHkgYW5kIGxhdGVuY3kgYWxhcm1zIGFuZCBDb250cmlidXRvciBJbnNpZ2h0IHJ1bGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5QWxhcm1zQW5kUnVsZXNcbntcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgem9uYWwgYXZhaWxhYmlsaXR5IGFsYXJtXG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBtZXRyaWNEZXRhaWxzIFxuICAgICAqIEBwYXJhbSBhdmFpbGFiaWxpdHlab25lSWQgXG4gICAgICogQHBhcmFtIG5hbWVTdWZmaXggXG4gICAgICogQHBhcmFtIGNvdW50ZXIgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVpvbmFsQXZhaWxhYmlsaXR5QWxhcm0oc2NvcGU6IENvbnN0cnVjdCwgbWV0cmljRGV0YWlsczogSU9wZXJhdGlvbk1ldHJpY0RldGFpbHMsIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCBjb3VudGVyOiBudW1iZXIsIG5hbWVTdWZmaXg/OiBzdHJpbmcpIDogSUFsYXJtXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEFsYXJtKHNjb3BlLCBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgKyBcIkFaXCIgKyBjb3VudGVyICsgXCJBdmFpbGFiaWxpdHlBbGFybVwiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiLVwiICsgbWV0cmljRGV0YWlscy5vcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgKyBcIi1zdWNjZXNzLXJhdGVcIiArIG5hbWVTdWZmaXgsXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogbWV0cmljRGV0YWlscy5ldmFsdWF0aW9uUGVyaW9kcyxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiBtZXRyaWNEZXRhaWxzLmRhdGFwb2ludHNUb0FsYXJtLFxuICAgICAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuTEVTU19USEFOX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIHRocmVzaG9sZDogbWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGQsXG4gICAgICAgICAgICBhY3Rpb25zRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLklHTk9SRSxcbiAgICAgICAgICAgIG1ldHJpYzogQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWMoe1xuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBhdmFpbGFiaWxpdHlcIixcbiAgICAgICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBtZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgIG1ldHJpY1R5cGU6IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuU1VDQ0VTU19SQVRFXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTsgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHpvbmFsIGxhdGVuY3kgYWxhcm1cbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG1ldHJpY0RldGFpbHMgXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcGFyYW0gbmFtZVN1ZmZpeCBcbiAgICAgKiBAcGFyYW0gY291bnRlciBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxMYXRlbmN5QWxhcm0oc2NvcGU6IENvbnN0cnVjdCwgbWV0cmljRGV0YWlsczogSU9wZXJhdGlvbk1ldHJpY0RldGFpbHMsIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCBjb3VudGVyOiBudW1iZXIsIG5hbWVTdWZmaXg/OiBzdHJpbmcpIDogSUFsYXJtXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEFsYXJtKHNjb3BlLCBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgKyBcIkFaXCIgKyBjb3VudGVyICsgXCJMYXRlbmN5QWxhcm1cIiwge1xuICAgICAgICAgICAgYWxhcm1OYW1lOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIi1cIiArIG1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpICsgXCItc3VjY2Vzcy1sYXRlbmN5XCIgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IG1ldHJpY0RldGFpbHMuZXZhbHVhdGlvblBlcmlvZHMsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogbWV0cmljRGV0YWlscy5kYXRhcG9pbnRzVG9BbGFybSxcbiAgICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLkdSRUFURVJfVEhBTl9USFJFU0hPTEQsXG4gICAgICAgICAgICB0aHJlc2hvbGQ6IG1ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkLFxuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5JR05PUkUsXG4gICAgICAgICAgICBtZXRyaWM6IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLmNyZWF0ZVpvbmFsTGF0ZW5jeU1ldHJpY3Moe1xuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIiBcIiArIG1ldHJpY0RldGFpbHMuYWxhcm1TdGF0aXN0aWMgKyBcIiBsYXRlbmN5XCIsXG4gICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogbWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICAgICAgc3RhdGlzdGljOiBtZXRyaWNEZXRhaWxzLmFsYXJtU3RhdGlzdGljXG4gICAgICAgICAgICB9KVswXVxuICAgICAgICB9KTsgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNvbXBvc2l0ZSBhbGFybSB3aGVuIGVpdGhlciBsYXRlbmN5IG9yIGF2YWlsYWJpbGl0eSBpcyBicmVhY2hlZCBpbiB0aGUgQXZhaWxhYmlsdGl5IFpvbmVcbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG9wZXJhdGlvbiBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZUlkIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEBwYXJhbSB6b25hbEF2YWlsYWJpbGl0eUFsYXJtIFxuICAgICAqIEBwYXJhbSB6b25hbExhdGVuY3lBbGFybSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxBdmFpbGFiaWxpdHlPckxhdGVuY3lDb21wb3NpdGVBbGFybShzY29wZTogQ29uc3RydWN0LCBvcGVyYXRpb25OYW1lOiBzdHJpbmcsIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCBjb3VudGVyOiBudW1iZXIsIHpvbmFsQXZhaWxhYmlsaXR5QWxhcm06IElBbGFybSwgem9uYWxMYXRlbmN5QWxhcm06IElBbGFybSwgbmFtZVN1ZmZpeD86IHN0cmluZyk6IElBbGFybSBcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9zaXRlQWxhcm0oc2NvcGUsIFwiQVpcIiArIGNvdW50ZXIgKyBcIlpvbmFsSW1wYWN0QWxhcm1cIiwge1xuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgYWxhcm1EZXNjcmlwdGlvbjogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgaGFzIGxhdGVuY3kgb3IgYXZhaWxhYmlsaXR5IGltcGFjdC4gVGhpcyBkb2VzIG5vdCBpbmRpY2F0ZSBpdCBpcyBhbiBvdXRsaWVyIGFuZCBzaG93cyBpc29sYXRlZCBpbXBhY3QuXCIsXG4gICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHtvcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCl9LWltcGFjdC1hZ2dyZWdhdGUtYWxhcm1gICsgbmFtZVN1ZmZpeCxcbiAgICAgICAgICAgIGFsYXJtUnVsZTogQWxhcm1SdWxlLmFueU9mKHpvbmFsQXZhaWxhYmlsaXR5QWxhcm0sIHpvbmFsTGF0ZW5jeUFsYXJtKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBhbGFybSB0aGF0IGNvbXBhcmVzIGVycm9yIHJhdGUgaW4gdGhpcyBBWiB0byB0aGUgb3ZlcmFsbCByZWdpb24gZXJyb3IgYmFzZWQgb25seSBvbiBtZXRyaWMgZGF0YVxuICAgICAqIEBwYXJhbSBzY29wZSBcbiAgICAgKiBAcGFyYW0gbWV0cmljRGV0YWlscyBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZUlkIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEBwYXJhbSBvdXRsaWVyVGhyZXNob2xkIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVab25hbEZhdWx0UmF0ZU91dGxpZXJBbGFybShzY29wZTogQ29uc3RydWN0LCBtZXRyaWNEZXRhaWxzOiBJT3BlcmF0aW9uTWV0cmljRGV0YWlscywgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIGNvdW50ZXI6IG51bWJlciwgb3V0bGllclRocmVzaG9sZDogbnVtYmVyLCBuYW1lU3VmZml4Pzogc3RyaW5nKTogSUFsYXJtXG4gICAge1xuICAgICAgICAvLyBUT0RPOiBUaGlzIGlzIGNyZWF0aW5nIG1ldHJpY3Mgd2l0aCB0aGUgc2FtZSBuYW1lc1xuICAgICAgICBsZXQgem9uYWxGYXVsdHM6IElNZXRyaWMgPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVab25hbEF2YWlsYWJpbGl0eU1ldHJpYyh7XG4gICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWQ6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IG1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLkZBVUxUX0NPVU5ULFxuICAgICAgICAgICAga2V5UHJlZml4OiBcImFcIlxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcmVnaW9uYWxGYXVsdHM6IElNZXRyaWMgPSBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpYyh7XG4gICAgICAgICAgICBtZXRyaWNEZXRhaWxzOiBtZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgbWV0cmljVHlwZTogQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVCxcbiAgICAgICAgICAgIGtleVByZWZpeDogXCJiXCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBBbGFybShzY29wZSwgXCJBWlwiICsgY291bnRlciArIFwiSXNvbGF0ZWRJbXBhY3RBbGFybVwiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHttZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKX0tbWFqb3JpdHktZXJyb3JzLWltcGFjdGAgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgbWV0cmljOiBuZXcgTWF0aEV4cHJlc3Npb24oe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IFwiKG0xIC8gbTIpXCIsXG4gICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibTFcIjogem9uYWxGYXVsdHMsXG4gICAgICAgICAgICAgICAgICAgIFwibTJcIjogcmVnaW9uYWxGYXVsdHNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBlcmlvZDogbWV0cmljRGV0YWlscy5wZXJpb2QsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiIHBlcmNlbnQgZmF1bHRzXCJcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGhyZXNob2xkOiBvdXRsaWVyVGhyZXNob2xkLFxuICAgICAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX09SX0VRVUFMX1RPX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuSUdOT1JFLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IG1ldHJpY0RldGFpbHMuZXZhbHVhdGlvblBlcmlvZHMsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogbWV0cmljRGV0YWlscy5kYXRhcG9pbnRzVG9BbGFybVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxIaWdoTGF0ZW5jeU91dGxpZXJBbGFybShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsICAgICAgIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsIFxuICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiBudW1iZXIsXG4gICAgICAgIG5hbWVTdWZmaXg/OiBzdHJpbmcsIFxuICAgICk6IElBbGFybVxuICAgIHtcbiAgICAgICAgbGV0IHpvbmFsTGF0ZW5jeTogSU1ldHJpYyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLmNyZWF0ZVpvbmFsTGF0ZW5jeU1ldHJpY3Moe1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCItXCIgKyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgKyBcIi1oaWdoLWxhdGVuY3ktcmVxdWVzdHNcIixcbiAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IG1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICBzdGF0aXN0aWM6IGBUQygke21ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkfTopYCxcbiAgICAgICAgICAgIGtleVByZWZpeDogXCJhXCJcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgbGV0IHJlZ2lvbmFsTGF0ZW5jeTogSU1ldHJpYyA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLmNyZWF0ZVJlZ2lvbmFsTGF0ZW5jeU1ldHJpY3Moe1xuICAgICAgICAgICAgbGFiZWw6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCItXCIgKyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgKyBcIi1oaWdoLWxhdGVuY3ktcmVxdWVzdHNcIixcbiAgICAgICAgICAgIG1ldHJpY0RldGFpbHM6IG1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICBzdGF0aXN0aWM6IGBUQygke21ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkfTopYCxcbiAgICAgICAgICAgIGtleVByZWZpeDogXCJiXCJcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBBbGFybShzY29wZSwgbWV0cmljRGV0YWlscy5vcGVyYXRpb25OYW1lICsgXCJBWlwiICsgY291bnRlciArIFwiSXNvbGF0ZWRJbXBhY3RBbGFybVwiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHttZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKX0tbWFqb3JpdHktaGlnaC1sYXRlbmN5LWltcGFjdGAgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgbWV0cmljOiBuZXcgTWF0aEV4cHJlc3Npb24oe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IFwiKG0xIC8gbTIpXCIsXG4gICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibTFcIjogem9uYWxMYXRlbmN5LFxuICAgICAgICAgICAgICAgICAgICBcIm0yXCI6IHJlZ2lvbmFsTGF0ZW5jeVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBtZXRyaWNEZXRhaWxzLnBlcmlvZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogYXZhaWxhYmlsaXR5Wm9uZUlkICsgXCIgcGVyY2VudCBoaWdoIGxhdGVuY3kgcmVxdWVzdHNcIlxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0aHJlc2hvbGQ6IG91dGxpZXJUaHJlc2hvbGQsXG4gICAgICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fT1JfRVFVQUxfVE9fVEhSRVNIT0xELFxuICAgICAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5JR05PUkUsXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogbWV0cmljRGV0YWlscy5ldmFsdWF0aW9uUGVyaW9kcyxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiBtZXRyaWNEZXRhaWxzLmRhdGFwb2ludHNUb0FsYXJtXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIGluc2lnaHQgcnVsZSB0aGF0IGNhbGN1bGF0ZXMgaG93IG1hbnkgaW5zdGFuY2VzIGFyZSByZXNwb25kaW5nIHRvIHJlcXVlc3RzIGluIFxuICAgICAqIHRoZSBzcGVjaWZpZWQgQVouIE9ubHkgdXNlZnVsIGZvciBzZXJ2ZXItc2lkZSBtZXRyaWNzIHNpbmNlIHRoZSBjYW5hcnkgZG9lc24ndCByZWNvcmQgaW5zdGFuY2UgaWQgbWV0cmljcy5cbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG1ldHJpY0RldGFpbHMgXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcGFyYW0gbG9nR3JvdXBzIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEBwYXJhbSBpbnN0YW5jZUlkUGF0aCBcbiAgICAgKiBAcGFyYW0gb3BlcmF0aW9uTmFtZVBhdGggXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZFBhdGggXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVNlcnZlclNpZGVJbnN0YW5jZXNIYW5kbGluZ1JlcXVlc3RzSW5UaGlzQVpSdWxlKFxuICAgICAgICBzY29wZTogQ29uc3RydWN0LCBcbiAgICAgICAgb3BlcmF0aW9uTmFtZTogc3RyaW5nLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsXG4gICAgICAgIHJ1bGVEZXRhaWxzOiBJQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHMsIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsXG4gICAgICAgIG5hbWVTdWZmaXg/OiBzdHJpbmcpIDogQ2ZuSW5zaWdodFJ1bGVcbiAgICB7XG4gICAgICAgIGxldCBydWxlQm9keSA9IG5ldyBJbnNpZ2h0UnVsZUJvZHkoKTtcbiAgICAgICAgcnVsZUJvZHkubG9nR3JvdXBOYW1lcyA9IHJ1bGVEZXRhaWxzLmxvZ0dyb3Vwcy5tYXAoeCA9PiB4LmxvZ0dyb3VwTmFtZSk7XG4gICAgICAgIHJ1bGVCb2R5LmFnZ3JlZ2F0ZU9uID0gXCJDb3VudFwiO1xuXG4gICAgICAgIHJ1bGVCb2R5LmNvbnRyaWJ1dGlvbiA9IHtcbiAgICAgICAgICAgIGtleXM6IFsgcnVsZURldGFpbHMuaW5zdGFuY2VJZEpzb25QYXRoIF0sXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIk1hdGNoXCI6IHJ1bGVEZXRhaWxzLmF2YWlsYWJpbGl0eVpvbmVJZEpzb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBcIkluXCI6IFsgYXZhaWxhYmlsaXR5Wm9uZUlkIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5vcGVyYXRpb25OYW1lSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5cIjogWyBvcGVyYXRpb25OYW1lIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0gYXMgdW5rbm93biBhcyBJQ29udHJpYnV0aW9uRGVmaW5pdGlvbjtcblxuICAgICAgICByZXR1cm4gbmV3IENmbkluc2lnaHRSdWxlKHNjb3BlLCBcIkFaXCIgKyBjb3VudGVyICsgXCJJbnN0YW5jZXNJblRoZUFaUnVsZVwiLCB7XG4gICAgICAgICAgICBydWxlTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgYC0ke29wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKX0taW5zdGFuY2VzLWluLXRoZS1hemAgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgcnVsZVN0YXRlOiBcIkVOQUJMRURcIixcbiAgICAgICAgICAgIHJ1bGVCb2R5OiBydWxlQm9keS50b0pzb24oKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnNpZ2h0IHJ1bGUgdGhhdCBjYWxjdWxhdGVzIHRoZSBpbnN0YW5jZXMgY29udHJpYnV0aW5nIHRvIGVycm9yc1xuICAgICAqIGluIHRoaXMgQVouIE9ubHkgdXNlZnVsIGZvciBzZXJ2ZXItc2lkZSBtZXRyaWNzIHNpbmNlIHRoZSBjYW5hcnkgZG9lc24ndCByZWNvcmQgaW5zdGFuY2UgaWQgbWV0cmljcy5cbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG9wZXJhdGlvbiBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZUlkIFxuICAgICAqIEBwYXJhbSBsb2dHcm91cHMgXG4gICAgICogQHBhcmFtIG5hbWVTdWZmaXggXG4gICAgICogQHBhcmFtIGNvdW50ZXIgXG4gICAgICogQHBhcmFtIGluc3RhbmNlSWRQYXRoIFxuICAgICAqIEBwYXJhbSBvcGVyYXRpb25OYW1lUGF0aCBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZUlkUGF0aCBcbiAgICAgKiBAcGFyYW0gZXJyb3JNZXRyaWNQYXRoIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVTZXJ2ZXJTaWRlSW5zdGFuY2VGYXVsdENvbnRyaWJ1dG9yc0luVGhpc0FaUnVsZShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IHN0cmluZywgXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCBcbiAgICAgICAgcnVsZURldGFpbHM6IElDb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlscywgICAgIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsXG4gICAgICAgIG5hbWVTdWZmaXg/OiBzdHJpbmdcbiAgICApOiBDZm5JbnNpZ2h0UnVsZVxuICAgIHtcbiAgICAgICAgbGV0IHJ1bGVCb2R5ID0gbmV3IEluc2lnaHRSdWxlQm9keSgpO1xuICAgICAgICBydWxlQm9keS5sb2dHcm91cE5hbWVzID0gcnVsZURldGFpbHMubG9nR3JvdXBzLm1hcCh4ID0+IHgubG9nR3JvdXBOYW1lKTtcbiAgICAgICAgcnVsZUJvZHkuYWdncmVnYXRlT24gPSBcIkNvdW50XCI7XG4gICAgICAgIHJ1bGVCb2R5LmNvbnRyaWJ1dGlvbiA9IHtcbiAgICAgICAgICAgIGtleXM6IFsgcnVsZURldGFpbHMuaW5zdGFuY2VJZEpzb25QYXRoIF0sXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIk1hdGNoXCI6IHJ1bGVEZXRhaWxzLmF2YWlsYWJpbGl0eVpvbmVJZEpzb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBcIkluXCI6IFsgYXZhaWxhYmlsaXR5Wm9uZUlkIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5vcGVyYXRpb25OYW1lSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5cIjogWyBvcGVyYXRpb25OYW1lIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5mYXVsdE1ldHJpY0pzb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBcIkdyZWF0ZXJUaGFuXCI6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0gYXMgdW5rbm93biBhcyBJQ29udHJpYnV0aW9uRGVmaW5pdGlvbjtcblxuICAgICAgICByZXR1cm4gbmV3IENmbkluc2lnaHRSdWxlKHNjb3BlLCBcIkFaXCIgKyBjb3VudGVyICsgXCJJbnN0YW5jZUVycm9yQ29udHJpYnV0aW9uUnVsZVwiLCB7XG4gICAgICAgICAgICBydWxlTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgYC0ke29wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKX0tcGVyLWluc3RhbmNlLWZhdWx0c2AgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgcnVsZVN0YXRlOiBcIkVOQUJMRURcIixcbiAgICAgICAgICAgIHJ1bGVCb2R5OiBydWxlQm9keS50b0pzb24oKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnNpZ2h0IHJ1bGUgdGhhdCBjYWxjdWxhdGVzIGluc3RhbmNlcyBjb250cmlidXRpbmcgdG8gaGlnaCBsYXRlbmN5IGluIHRoaXMgQVouIE9ubHkgXG4gICAgICogdXNlZnVsIGZvciBzZXJ2ZXItc2lkZSBtZXRyaWNzIHNpbmNlIHRoZSBjYW5hcnkgZG9lc24ndCByZWNvcmQgaW5zdGFuY2UgaWQgbWV0cmljcy5cbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG1ldHJpY0RldGFpbHMgXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcGFyYW0gbG9nR3JvdXBzIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVTZXJ2ZXJTaWRlSW5zdGFuY2VIaWdoTGF0ZW5jeUNvbnRyaWJ1dG9yc0luVGhpc0FaUnVsZShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsXG4gICAgICAgIHJ1bGVEZXRhaWxzOiBJQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHMsICBcbiAgICAgICAgY291bnRlcjogbnVtYmVyLCAgXG4gICAgICAgIG5hbWVTdWZmaXg/OiBzdHJpbmdcbiAgICApOiBDZm5JbnNpZ2h0UnVsZVxuICAgIHtcbiAgICAgICAgbGV0IHJ1bGVCb2R5ID0gbmV3IEluc2lnaHRSdWxlQm9keSgpO1xuICAgICAgICBydWxlQm9keS5sb2dHcm91cE5hbWVzID0gcnVsZURldGFpbHMubG9nR3JvdXBzLm1hcCh4ID0+IHgubG9nR3JvdXBOYW1lKTtcbiAgICAgICAgcnVsZUJvZHkuYWdncmVnYXRlT24gPSBcIkNvdW50XCI7XG4gICAgICAgIHJ1bGVCb2R5LmNvbnRyaWJ1dGlvbiA9IHtcbiAgICAgICAgICAgIGtleXM6IFsgcnVsZURldGFpbHMuaW5zdGFuY2VJZEpzb25QYXRoIF0sXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIk1hdGNoXCI6IHJ1bGVEZXRhaWxzLmF2YWlsYWJpbGl0eVpvbmVJZEpzb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBcIkluXCI6IFsgYXZhaWxhYmlsaXR5Wm9uZUlkIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5vcGVyYXRpb25OYW1lSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5cIjogWyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIk1hdGNoXCI6IHJ1bGVEZXRhaWxzLnN1Y2Nlc3NMYXRlbmN5TWV0cmljSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiR3JlYXRlclRoYW5cIjogbWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0gYXMgdW5rbm93biBhcyBJQ29udHJpYnV0aW9uRGVmaW5pdGlvbjtcblxuICAgICAgICByZXR1cm4gbmV3IENmbkluc2lnaHRSdWxlKHNjb3BlLCBcIkFaXCIgKyBjb3VudGVyICsgXCJMYXRlbmN5Q29udHJpYnV0b3JzUnVsZVwiLCB7XG4gICAgICAgICAgICBydWxlTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgYC0ke21ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpfS1wZXItaW5zdGFuY2UtaGlnaC1sYXRlbmN5YCArIG5hbWVTdWZmaXgsXG4gICAgICAgICAgICBydWxlU3RhdGU6IFwiRU5BQkxFRFwiLFxuICAgICAgICAgICAgcnVsZUJvZHk6IHJ1bGVCb2R5LnRvSnNvbigpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIGFsYXJtIHRoYXQgaW5kaWNhdGVzIHNvbWUgcGVyY2VudGFnZSBvZiB0aGUgaW5zdGFuY2VzIGluIHRoaXMgQVogYXJlIHByb2R1Y2luZyBlcnJvcnMuIE9ubHlcbiAgICAgKiB1c2VmdWwgZm9yIHNlcnZlci1zaWRlIG1ldHJpY3Mgc2luY2UgdGhlIGNhbmFyeSBkb2Vzbid0IHJlY29yZCBpbnN0YW5jZSBpZCBtZXRyaWNzLlxuICAgICAqIEBwYXJhbSBzY29wZSBcbiAgICAgKiBAcGFyYW0gbWV0cmljRGV0YWlscyBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZUlkIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEBwYXJhbSBvdXRsaWVyVGhyZXNob2xkIFxuICAgICAqIEBwYXJhbSBpbnN0YW5jZUZhdWx0UmF0ZUNvbnRyaWJ1dG9yc0luVGhpc0FaIFxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXNIYW5kbGluZ1JlcXVlc3RzSW5UaGlzQVogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVNlcnZlclNpZGVab25hbE1vcmVUaGFuT25lSW5zdGFuY2VQcm9kdWNpbmdGYXVsdHNBbGFybShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsIFxuICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiBudW1iZXIsXG4gICAgICAgIGluc3RhbmNlRmF1bHRSYXRlQ29udHJpYnV0b3JzSW5UaGlzQVo6IENmbkluc2lnaHRSdWxlLFxuICAgICAgICBpbnN0YW5jZXNIYW5kbGluZ1JlcXVlc3RzSW5UaGlzQVo6IENmbkluc2lnaHRSdWxlLFxuICAgICAgICBuYW1lU3VmZml4Pzogc3RyaW5nXG4gICAgKSA6IElBbGFybVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBbGFybShzY29wZSwgXCJBWlwiICsgY291bnRlciArIFwiTW9yZVRoYW5PbmVBbGFybUZvckVycm9yc1wiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHttZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKX0tbXVsdGlwbGUtaW5zdGFuY2VzLWZhdWx0c2AgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgbWV0cmljOiBuZXcgTWF0aEV4cHJlc3Npb24oe1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGBJTlNJR0hUX1JVTEVfTUVUUklDKFxcXCIke2luc3RhbmNlRmF1bHRSYXRlQ29udHJpYnV0b3JzSW5UaGlzQVouYXR0clJ1bGVOYW1lfVxcXCIsIFxcXCJVbmlxdWVDb250cmlidXRvcnNcXFwiKSAvIElOU0lHSFRfUlVMRV9NRVRSSUMoXFxcIiR7aW5zdGFuY2VzSGFuZGxpbmdSZXF1ZXN0c0luVGhpc0FaLmF0dHJSdWxlTmFtZX1cXFwiLCBcXFwiVW5pcXVlQ29udHJpYnV0b3JzXFxcIilgLFxuICAgICAgICAgICAgICAgIHBlcmlvZDogbWV0cmljRGV0YWlscy5wZXJpb2QsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiBtZXRyaWNEZXRhaWxzLmV2YWx1YXRpb25QZXJpb2RzLFxuICAgICAgICAgICAgdGhyZXNob2xkOiBvdXRsaWVyVGhyZXNob2xkLFxuICAgICAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX09SX0VRVUFMX1RPX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiBtZXRyaWNEZXRhaWxzLmRhdGFwb2ludHNUb0FsYXJtLFxuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5JR05PUkVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gYWxhcm0gaW5kaWNhdGluZyBtb3JlIHRoYW4gc29tZSBwZXJjZW50YWdlIG9mIGluc3RhbmNlcyBpbiB0aGlzIEFaIFxuICAgICAqIGFyZSBjb250cmlidXRpbmcgdG8gaGlnaCBsYXRlbmN5LiBPbmx5IHVzZWZ1bCBmb3Igc2VydmVyLXNpZGUgbWV0cmljcyBzaW5jZSBcbiAgICAgKiB0aGUgY2FuYXJ5IGRvZXNuJ3QgcmVjb3JkIGluc3RhbmNlIGlkIG1ldHJpY3MuXG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBtZXRyaWNEZXRhaWxzIFxuICAgICAqIEBwYXJhbSBhdmFpbGFiaWxpdHlab25lSWQgXG4gICAgICogQHBhcmFtIG5hbWVTdWZmaXggXG4gICAgICogQHBhcmFtIGNvdW50ZXIgXG4gICAgICogQHBhcmFtIG91dGxpZXJUaHJlc2hvbGQgXG4gICAgICogQHBhcmFtIGluc3RhbmNlSGlnaExhdGVuY3lDb250cmlidXRvcnNJblRoaXNBWiBcbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzSGFuZGxpbmdSZXF1ZXN0c0luVGhpc0FaIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVTZXJ2ZXJTaWRlWm9uYWxNb3JlVGhhbk9uZUluc3RhbmNlUHJvZHVjaW5nSGlnaExhdGVuY3lBbGFybShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsICAgICAgICBcbiAgICAgICAgY291bnRlcjogbnVtYmVyLCBcbiAgICAgICAgb3V0bGllclRocmVzaG9sZDogbnVtYmVyLFxuICAgICAgICBpbnN0YW5jZUhpZ2hMYXRlbmN5Q29udHJpYnV0b3JzSW5UaGlzQVo6IENmbkluc2lnaHRSdWxlLFxuICAgICAgICBpbnN0YW5jZXNIYW5kbGluZ1JlcXVlc3RzSW5UaGlzQVo6IENmbkluc2lnaHRSdWxlLFxuICAgICAgICBuYW1lU3VmZml4Pzogc3RyaW5nXG4gICAgKSA6IElBbGFybVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBbGFybShzY29wZSwgXCJBWlwiICsgY291bnRlciArIFwiTW9yZVRoYW5PbmVBbGFybUZvckhpZ2hMYXRlbmN5XCIsIHtcbiAgICAgICAgICAgIGFsYXJtTmFtZTogYXZhaWxhYmlsaXR5Wm9uZUlkICsgYC0ke21ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpfS1tdWx0aXBsZS1pbnN0YW5jZXMtaGlnaC1sYXRlbmN5YCArIG5hbWVTdWZmaXgsXG4gICAgICAgICAgICBtZXRyaWM6IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogYElOU0lHSFRfUlVMRV9NRVRSSUMoXFxcIiR7aW5zdGFuY2VIaWdoTGF0ZW5jeUNvbnRyaWJ1dG9yc0luVGhpc0FaLmF0dHJSdWxlTmFtZX1cXFwiLCBcXFwiVW5pcXVlQ29udHJpYnV0b3JzXFxcIikgLyBJTlNJR0hUX1JVTEVfTUVUUklDKFxcXCIke2luc3RhbmNlc0hhbmRsaW5nUmVxdWVzdHNJblRoaXNBWi5hdHRyUnVsZU5hbWV9XFxcIiwgXFxcIlVuaXF1ZUNvbnRyaWJ1dG9yc1xcXCIpYCxcbiAgICAgICAgICAgICAgICBwZXJpb2Q6IG1ldHJpY0RldGFpbHMucGVyaW9kLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogbWV0cmljRGV0YWlscy5ldmFsdWF0aW9uUGVyaW9kcyxcbiAgICAgICAgICAgIHRocmVzaG9sZDogb3V0bGllclRocmVzaG9sZCxcbiAgICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLkdSRUFURVJfVEhBTl9PUl9FUVVBTF9UT19USFJFU0hPTEQsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogbWV0cmljRGV0YWlscy5kYXRhcG9pbnRzVG9BbGFybSxcbiAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuSUdOT1JFXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIGFsYXJtIHRoYXQgaW5kaWNhdGVzIHRoaXMgQVogYXMgYW4gb3V0bGllclxuICAgICAqIGZvciBhdmFpbGFiaWxpdHkgb3IgbGF0ZW5jeS4gVGhpcyBkb2VzIG5vdCBlbnN1cmUgdGhhdCB0aGUgZXJyb3JzXG4gICAgICogb3IgbGF0ZW5jeSBvcmlnaW5hdGUgZnJvbSBtb3JlIHRoYW4gb25lIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSBzY29wZSBcbiAgICAgKiBAcGFyYW0gb3BlcmF0aW9uIFxuICAgICAqIEBwYXJhbSBhdmFpbGFiaWxpdHlab25lSWQgXG4gICAgICogQHBhcmFtIGxvZ0dyb3VwcyBcbiAgICAgKiBAcGFyYW0gbmFtZVN1ZmZpeCBcbiAgICAgKiBAcGFyYW0gY291bnRlciBcbiAgICAgKiBAcGFyYW0gYXpJc091dGxpZXJGb3JGYXVsdHNBbGFybSBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5SW1wYWN0QWxhcm0gXG4gICAgICogQHBhcmFtIGF6SXNPdXRsaWVyRm9yTGF0ZW5jeUFsYXJtIFxuICAgICAqIEBwYXJhbSBsYXRlbmN5SW1wYWN0QWxhcm0gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUNhbmFyeUlzb2xhdGVkQVpJbXBhY3RBbGFybShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IHN0cmluZywgXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCAgICAgIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsIFxuICAgICAgICBheklzT3V0bGllckZvckZhdWx0c0FsYXJtOiBJQWxhcm0sXG4gICAgICAgIGF2YWlsYWJpbGl0eUltcGFjdEFsYXJtOiBJQWxhcm0sXG4gICAgICAgIGF6SXNPdXRsaWVyRm9yTGF0ZW5jeUFsYXJtOiBJQWxhcm0sXG4gICAgICAgIGxhdGVuY3lJbXBhY3RBbGFybTogSUFsYXJtLFxuICAgICAgICBuYW1lU3VmZml4Pzogc3RyaW5nLCBcbiAgICApIDogSUFsYXJtXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUFsYXJtKHNjb3BlLCBvcGVyYXRpb25OYW1lICsgXCJBWlwiICsgY291bnRlciArIFwiSXNvbGF0ZWRJbXBhY3RBbGFybVwiLCB7XG4gICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHtvcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCl9LWlzb2xhdGVkLWltcGFjdC1hbGFybWAgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgYWxhcm1SdWxlOiBBbGFybVJ1bGUuYW55T2YoXG4gICAgICAgICAgICAgICAgQWxhcm1SdWxlLmFsbE9mKGF6SXNPdXRsaWVyRm9yRmF1bHRzQWxhcm0sIGF2YWlsYWJpbGl0eUltcGFjdEFsYXJtKSwgXG4gICAgICAgICAgICAgICAgQWxhcm1SdWxlLmFsbE9mKGF6SXNPdXRsaWVyRm9yTGF0ZW5jeUFsYXJtLCBsYXRlbmN5SW1wYWN0QWxhcm0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNlcnZlciBzaWRlIGFsYXJtIHRvIGlkZW50aWZ5IGlzb2xhdGVkIHNpbmdsZSBBWlxuICAgICAqIGltcGFjdCBtZWFuaW5nIHRoYXQgdGhpcyBvbmUgQVogaXMgYWZmZWN0ZWQgYW5kIHRoZSBvdGhlcnMgYXJlbid0XG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBvcGVyYXRpb24gXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcGFyYW0gbmFtZVN1ZmZpeCBcbiAgICAgKiBAcGFyYW0gY291bnRlciBcbiAgICAgKiBAcGFyYW0gYXpJc091dGxpZXJGb3JGYXVsdHNBbGFybSBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5SW1wYWN0QWxhcm0gXG4gICAgICogQHBhcmFtIG1vcmVUaGFuT25lSW5zdGFuY2VDb250cmlidXRpbmdUb0ZhdWx0cyBcbiAgICAgKiBAcGFyYW0gYXpJc091dGxpZXJGb3JMYXRlbmN5QWxhcm0gXG4gICAgICogQHBhcmFtIGxhdGVuY3lJbXBhY3RBbGFybSBcbiAgICAgKiBAcGFyYW0gbW9yZVRoYW5PbmVJbnN0YW5jZUNvbnRyaWJ1dGluZ1RvTGF0ZW5jeSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlU2VydmVyU2lkZUlzb2xhdGVkQVpJbXBhY3RBbGFybShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IHN0cmluZywgXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCAgICAgXG4gICAgICAgIGNvdW50ZXI6IG51bWJlciwgXG4gICAgICAgIGF6SXNPdXRsaWVyRm9yRmF1bHRzQWxhcm06IElBbGFybSxcbiAgICAgICAgYXZhaWxhYmlsaXR5SW1wYWN0QWxhcm06IElBbGFybSxcbiAgICAgICAgbW9yZVRoYW5PbmVJbnN0YW5jZUNvbnRyaWJ1dGluZ1RvRmF1bHRzOiBJQWxhcm0sXG4gICAgICAgIGF6SXNPdXRsaWVyRm9yTGF0ZW5jeUFsYXJtOiBJQWxhcm0sXG4gICAgICAgIGxhdGVuY3lJbXBhY3RBbGFybTogSUFsYXJtLFxuICAgICAgICBtb3JlVGhhbk9uZUluc3RhbmNlQ29udHJpYnV0aW5nVG9MYXRlbmN5OiBJQWxhcm0sXG4gICAgICAgIG5hbWVTdWZmaXg/OiBzdHJpbmcsIFxuICAgICkgOiBJQWxhcm1cbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9zaXRlQWxhcm0oc2NvcGUsIG9wZXJhdGlvbk5hbWUgKyBcIkFaXCIgKyBjb3VudGVyICsgXCJJc29sYXRlZEltcGFjdEFsYXJtXCIgKyBuYW1lU3VmZml4LCB7XG4gICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHtvcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCl9LWlzb2xhdGVkLWltcGFjdC1hbGFybWAgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgYWxhcm1SdWxlOiBBbGFybVJ1bGUuYW55T2YoXG4gICAgICAgICAgICAgICAgKG1vcmVUaGFuT25lSW5zdGFuY2VDb250cmlidXRpbmdUb0ZhdWx0cyA9PT0gdW5kZWZpbmVkIHx8IG1vcmVUaGFuT25lSW5zdGFuY2VDb250cmlidXRpbmdUb0ZhdWx0cyA9PSBudWxsKSA/IEFsYXJtUnVsZS5hbGxPZihheklzT3V0bGllckZvckZhdWx0c0FsYXJtLCBhdmFpbGFiaWxpdHlJbXBhY3RBbGFybSkgOiBBbGFybVJ1bGUuYWxsT2YoYXpJc091dGxpZXJGb3JGYXVsdHNBbGFybSwgYXZhaWxhYmlsaXR5SW1wYWN0QWxhcm0sIG1vcmVUaGFuT25lSW5zdGFuY2VDb250cmlidXRpbmdUb0ZhdWx0cyksIFxuICAgICAgICAgICAgICAgIChtb3JlVGhhbk9uZUluc3RhbmNlQ29udHJpYnV0aW5nVG9MYXRlbmN5ID09PSB1bmRlZmluZWQgfHwgbW9yZVRoYW5PbmVJbnN0YW5jZUNvbnRyaWJ1dGluZ1RvTGF0ZW5jeSA9PSBudWxsKSA/IEFsYXJtUnVsZS5hbGxPZihheklzT3V0bGllckZvckxhdGVuY3lBbGFybSwgbGF0ZW5jeUltcGFjdEFsYXJtKSA6IEFsYXJtUnVsZS5hbGxPZihheklzT3V0bGllckZvckxhdGVuY3lBbGFybSwgbGF0ZW5jeUltcGFjdEFsYXJtLCBtb3JlVGhhbk9uZUluc3RhbmNlQ29udHJpYnV0aW5nVG9MYXRlbmN5KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFsYXJtIHRoYXQgZmlyZXMgaWYgZWl0aGVyIHRoZSBjYW5hcnkgb3IgdGhlIFxuICAgICAqIHNlcnZlciBzaWRlIGRldGVjdCBzaW5nbGUgQVogaXNvbGF0ZWQgaW1wYWN0XG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBvcGVyYXRpb24gXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcGFyYW0gY291bnRlciBcbiAgICAgKiBAcGFyYW0gc2VydmVyU2lkZUFsYXJtIFxuICAgICAqIEBwYXJhbSBjYW5hcnlBbGFybSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlQWdncmVnYXRlSXNvbGF0ZWRBWkltcGFjdEFsYXJtKFxuICAgICAgICBzY29wZTogQ29uc3RydWN0LCBcbiAgICAgICAgb3BlcmF0aW9uOiBJT3BlcmF0aW9uLCBcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIFxuICAgICAgICBjb3VudGVyOiBudW1iZXIsIFxuICAgICAgICBzZXJ2ZXJTaWRlQWxhcm06IElBbGFybSxcbiAgICAgICAgY2FuYXJ5QWxhcm06IElBbGFybVxuICAgICkgOiBJQWxhcm1cbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcG9zaXRlQWxhcm0oc2NvcGUsIG9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJBWlwiICsgY291bnRlciArIFwiQWdncmVnYXRlSXNvbGF0ZWRJbXBhY3RBbGFybVwiLCB7XG4gICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IGF2YWlsYWJpbGl0eVpvbmVJZCArIGAtJHtvcGVyYXRpb24ub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpfS1hZ2dyZWdhdGUtaXNvbGF0ZWQtaW1wYWN0LWFsYXJtYCxcbiAgICAgICAgICAgIGFsYXJtUnVsZTogQWxhcm1SdWxlLmFueU9mKHNlcnZlclNpZGVBbGFybSwgY2FuYXJ5QWxhcm0pLFxuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSByZWdpb25hbCBhdmFpbGFiaWxpdHkgYWxhcm0gZm9yIHRoZSBvcGVyYXRpb25cbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIG1ldHJpY0RldGFpbHMgXG4gICAgICogQHBhcmFtIG5hbWVTdWZmaXggXG4gICAgICogQHBhcmFtIGNvdW50ZXIgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVJlZ2lvbmFsQXZhaWxhYmlsaXR5QWxhcm0oc2NvcGU6IENvbnN0cnVjdCwgbWV0cmljRGV0YWlsczogSU9wZXJhdGlvbk1ldHJpY0RldGFpbHMsIG5hbWVTdWZmaXg6IHN0cmluZykgOiBJQWxhcm1cbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQWxhcm0oc2NvcGUsIG1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZSArIFwiUmVnaW9uYWxBdmFpbGFiaWxpdHlBbGFybVwiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCItXCIgKyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKSArIFwiLXN1Y2Nlc3MtcmF0ZVwiICsgbmFtZVN1ZmZpeCxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiBtZXRyaWNEZXRhaWxzLmV2YWx1YXRpb25QZXJpb2RzLFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IG1ldHJpY0RldGFpbHMuZGF0YXBvaW50c1RvQWxhcm0sXG4gICAgICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5MRVNTX1RIQU5fVEhSRVNIT0xELFxuICAgICAgICAgICAgdGhyZXNob2xkOiBtZXRyaWNEZXRhaWxzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCxcbiAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuSUdOT1JFLFxuICAgICAgICAgICAgbWV0cmljOiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpYyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCIgYXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogbWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlNVQ0NFU1NfUkFURVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7IFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSByZWdpb25hbCBsYXRlbmN5IGFsYXJtIGZvciB0aGUgb3BlcmF0aW9uXG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBtZXRyaWNEZXRhaWxzIFxuICAgICAqIEBwYXJhbSBuYW1lU3VmZml4IFxuICAgICAqIEBwYXJhbSBjb3VudGVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbExhdGVuY3lBbGFybShzY29wZTogQ29uc3RydWN0LCBtZXRyaWNEZXRhaWxzOiBJT3BlcmF0aW9uTWV0cmljRGV0YWlscywgbmFtZVN1ZmZpeDogc3RyaW5nKSA6IElBbGFybVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBbGFybShzY29wZSwgbWV0cmljRGV0YWlscy5vcGVyYXRpb25OYW1lICsgXCJSZWdpb25hbExhdGVuY3lBbGFybVwiLCB7XG4gICAgICAgICAgICBhbGFybU5hbWU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCItXCIgKyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKSArIFwiLXN1Y2Nlc3MtbGF0ZW5jeVwiICsgbmFtZVN1ZmZpeCxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiBtZXRyaWNEZXRhaWxzLmV2YWx1YXRpb25QZXJpb2RzLFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IG1ldHJpY0RldGFpbHMuZGF0YXBvaW50c1RvQWxhcm0sXG4gICAgICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fVEhSRVNIT0xELFxuICAgICAgICAgICAgdGhyZXNob2xkOiBtZXRyaWNEZXRhaWxzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCxcbiAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuSUdOT1JFLFxuICAgICAgICAgICAgbWV0cmljOiBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy5jcmVhdGVSZWdpb25hbExhdGVuY3lNZXRyaWNzKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcIiBcIiArIG1ldHJpY0RldGFpbHMuYWxhcm1TdGF0aXN0aWMgKyBcIiBsYXRlbmN5XCIsXG4gICAgICAgICAgICAgICAgbWV0cmljRGV0YWlsczogbWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICBtZXRyaWNUeXBlOiBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1ksXG4gICAgICAgICAgICAgICAgc3RhdGlzdGljOiBtZXRyaWNEZXRhaWxzLmFsYXJtU3RhdGlzdGljXG4gICAgICAgICAgICB9KVswXVxuICAgICAgICB9KTsgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBjb21wb3NpdGUgYWxhcm0gY29tYmluaW5nIGxhdGVuY3kgYW5kIGF2YWlsYWJpbGl0eSBhbGFybXMgZm9yIHRoaXMgb3BlcmF0aW9uIGluIHRoZSByZWdpb25cbiAgICAgKiBhcyBtZWFzdXJlZCBmcm9tIGVpdGhlciB0aGUgc2VydmVyIHNpZGUgb3IgY2FuYXJ5XG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSBvcGVyYXRpb24gXG4gICAgICogQHBhcmFtIG5hbWVTdWZmaXggXG4gICAgICogQHBhcmFtIHJlZ2lvbmFsQXZhaWxhYmlsaXR5QWxhcm0gXG4gICAgICogQHBhcmFtIHJlZ2lvbmFsTGF0ZW5jeUFsYXJtIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbEN1c3RvbWVyRXhwZXJpZW5jZUFsYXJtKHNjb3BlOiBDb25zdHJ1Y3QsIG9wZXJhdGlvbk5hbWU6IHN0cmluZywgbmFtZVN1ZmZpeDogc3RyaW5nLCByZWdpb25hbEF2YWlsYWJpbGl0eUFsYXJtOiBJQWxhcm0sIHJlZ2lvbmFsTGF0ZW5jeUFsYXJtOiBJQWxhcm0pIDogSUFsYXJtXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUFsYXJtKHNjb3BlLCBvcGVyYXRpb25OYW1lICsgXCJSZWdpb25hbEN1c3RvbWVyRXhwZXJpZW5jZUFsYXJtXCIsICB7XG4gICAgICAgICAgICBjb21wb3NpdGVBbGFybU5hbWU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCItXCIgKyBvcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgKyBcIi1jdXN0b21lci1leHBlcmllbmNlLWltYWN0XCIgKyBuYW1lU3VmZml4LFxuICAgICAgICAgICAgYWxhcm1SdWxlOiBBbGFybVJ1bGUuYW55T2YocmVnaW9uYWxBdmFpbGFiaWxpdHlBbGFybSwgcmVnaW9uYWxMYXRlbmN5QWxhcm0pXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbEluc3RhbmNlQ29udHJpYnV0b3JzVG9IaWdoTGF0ZW5jeShcbiAgICAgICAgc2NvcGU6IENvbnN0cnVjdCwgXG4gICAgICAgIG1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzLCBcbiAgICAgICAgcnVsZURldGFpbHM6IElDb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlsc1xuICAgICkgOiBDZm5JbnNpZ2h0UnVsZVxuICAgIHtcbiAgICAgICAgbGV0IHJ1bGVCb2R5ID0gbmV3IEluc2lnaHRSdWxlQm9keSgpO1xuICAgICAgICBydWxlQm9keS5sb2dHcm91cE5hbWVzID0gcnVsZURldGFpbHMubG9nR3JvdXBzLm1hcCh4ID0+IHgubG9nR3JvdXBOYW1lKTtcbiAgICAgICAgcnVsZUJvZHkuYWdncmVnYXRlT24gPSBcIkNvdW50XCI7XG4gICAgICAgIHJ1bGVCb2R5LmNvbnRyaWJ1dGlvbiA9IHtcbiAgICAgICAgICAgIGtleXM6IFsgcnVsZURldGFpbHMuaW5zdGFuY2VJZEpzb25QYXRoIF0sXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIk1hdGNoXCI6IHJ1bGVEZXRhaWxzLnN1Y2Nlc3NMYXRlbmN5TWV0cmljSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiR3JlYXRlclRoYW5cIjogbWV0cmljRGV0YWlscy5zdWNjZXNzQWxhcm1UaHJlc2hvbGRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5vcGVyYXRpb25OYW1lSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5cIjogWyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSBhcyB1bmtub3duIGFzIElDb250cmlidXRpb25EZWZpbml0aW9uO1xuXG4gICAgICAgIHJldHVybiBuZXcgQ2ZuSW5zaWdodFJ1bGUoc2NvcGUsIFwiUmVnaW9uUGVySW5zdGFuY2VIaWdoTGF0ZW5jeVJ1bGVcIiwge1xuICAgICAgICAgICAgcnVsZU5hbWU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgYC0ke21ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpfS1wZXItaW5zdGFuY2UtaGlnaC1sYXRlbmN5LXNlcnZlcmAsXG4gICAgICAgICAgICBydWxlU3RhdGU6IFwiRU5BQkxFRFwiLFxuICAgICAgICAgICAgcnVsZUJvZHk6IHJ1bGVCb2R5LnRvSnNvbigpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbEluc3RhbmNlQ29udHJpYnV0b3JzVG9GYXVsdHMoXG4gICAgICAgIHNjb3BlOiBDb25zdHJ1Y3QsIFxuICAgICAgICBtZXRyaWNEZXRhaWxzOiBJT3BlcmF0aW9uTWV0cmljRGV0YWlscywgXG4gICAgICAgIHJ1bGVEZXRhaWxzOiBJQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHNcbiAgICApIDogQ2ZuSW5zaWdodFJ1bGVcbiAgICB7XG4gICAgICAgIGxldCBydWxlQm9keSA9IG5ldyBJbnNpZ2h0UnVsZUJvZHkoKTtcbiAgICAgICAgcnVsZUJvZHkubG9nR3JvdXBOYW1lcyA9IHJ1bGVEZXRhaWxzLmxvZ0dyb3Vwcy5tYXAoeCA9PiB4LmxvZ0dyb3VwTmFtZSk7XG4gICAgICAgIHJ1bGVCb2R5LmFnZ3JlZ2F0ZU9uID0gXCJDb3VudFwiO1xuICAgICAgICBydWxlQm9keS5jb250cmlidXRpb24gPSB7XG4gICAgICAgICAgICBrZXlzOiBbIHJ1bGVEZXRhaWxzLmluc3RhbmNlSWRKc29uUGF0aCBdLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5zdWNjZXNzTGF0ZW5jeU1ldHJpY0pzb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBcIkdyZWF0ZXJUaGFuXCI6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJNYXRjaFwiOiBydWxlRGV0YWlscy5vcGVyYXRpb25OYW1lSnNvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5cIjogWyBtZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSBhcyB1bmtub3duIGFzIElDb250cmlidXRpb25EZWZpbml0aW9uO1xuXG4gICAgICAgIHJldHVybiBuZXcgQ2ZuSW5zaWdodFJ1bGUoc2NvcGUsIFwiUmVnaW9uUGVySW5zdGFuY2VFcnJvclJ1bGVcIiwge1xuICAgICAgICAgICAgcnVsZU5hbWU6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgYC0ke21ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpfS1wZXItaW5zdGFuY2UtZmF1bHRzLXNlcnZlcmAsXG4gICAgICAgICAgICBydWxlU3RhdGU6IFwiRU5BQkxFRFwiLFxuICAgICAgICAgICAgcnVsZUJvZHk6IHJ1bGVCb2R5LnRvSnNvbigpXG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=