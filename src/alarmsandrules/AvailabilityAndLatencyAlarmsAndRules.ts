import { Construct } from "constructs";
import { IAlarm, Alarm, IMetric, CompositeAlarm, AlarmRule, MathExpression, CfnInsightRule, ComparisonOperator, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { LatencyMetricType } from "../utilities/LatencyMetricType";
import { Fn } from "aws-cdk-lib";
import { IContributionDefinition, InsightRuleBody } from "./InsightRuleBody";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "../services/IOperationMetricDetails";
import { IOperation } from "../services/IOperation";

/**
 * Class used to create availability and latency alarms and Contributor Insight rules
 */
export class AvailabilityAndLatencyAlarmsAndRules
{
    /**
     * Creates a zonal availability alarm
     * @param scope 
     * @param metricDetails 
     * @param availabilityZoneId 
     * @param nameSuffix 
     * @param counter 
     * @returns 
     */
    static createZonalAvailabilityAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, nameSuffix?: string) : IAlarm
    {
        return new Alarm(scope, metricDetails.operationName + "AZ" + counter + "AvailabilityAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                label: availabilityZoneId + " availability",
                metricDetails: metricDetails,
                metricType: AvailabilityMetricType.SUCCESS_RATE
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
    static createZonalLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, nameSuffix?: string) : IAlarm
    {
        return new Alarm(scope, metricDetails.operationName + "AZ" + counter + "LatencyAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
                availabilityZoneId: availabilityZoneId,
                label: availabilityZoneId + " " + metricDetails.alarmStatistic + " latency",
                metricDetails: metricDetails,
                metricType: LatencyMetricType.SUCCESS_LATENCY,
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
    static createZonalAvailabilityOrLatencyCompositeAlarm(scope: Construct, operationName: string, availabilityZoneId: string, counter: number, zonalAvailabilityAlarm: IAlarm, zonalLatencyAlarm: IAlarm, nameSuffix?: string): IAlarm 
    {
        return new CompositeAlarm(scope, "AZ" + counter + "ZonalImpactAlarm", {
            actionsEnabled: false,
            alarmDescription: availabilityZoneId + " has latency or availability impact. This does not indicate it is an outlier and shows isolated impact.",
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-impact-aggregate-alarm` + nameSuffix,
            alarmRule: AlarmRule.anyOf(zonalAvailabilityAlarm, zonalLatencyAlarm)
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
    static createZonalFaultRateOutlierAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, outlierThreshold: number, nameSuffix?: string): IAlarm
    {
        // TODO: This is creating metrics with the same names
        let zonalFaults: IMetric = AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            metricDetails: metricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: "a"
        });

        let regionalFaults: IMetric = AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
            metricDetails: metricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: "b"
        });

        return new Alarm(scope, "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-majority-errors-impact` + nameSuffix,
            metric: new MathExpression({
                expression: "(m1 / m2)",
                usingMetrics: {
                    "m1": zonalFaults,
                    "m2": regionalFaults
                },
                period: metricDetails.period,
                label: availabilityZoneId + " percent faults"
            }),
            threshold: outlierThreshold,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: TreatMissingData.IGNORE,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm
        });
    }

    static createZonalHighLatencyOutlierAlarm(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        availabilityZoneId: string,       
        counter: number, 
        outlierThreshold: number,
        nameSuffix?: string, 
    ): IAlarm
    {
        let zonalLatency: IMetric = AvailabilityAndLatencyMetrics.createZonalLatencyMetrics({
            availabilityZoneId: availabilityZoneId,
            label: availabilityZoneId + "-" + metricDetails.operationName + "-high-latency-requests",
            metricDetails: metricDetails,
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
            keyPrefix: "a"
        })[0];

        let regionalLatency: IMetric = AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
            label: Fn.ref("AWS::Region") + "-" + metricDetails.operationName + "-high-latency-requests",
            metricDetails: metricDetails,
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
            keyPrefix: "b"
        })[0];

        return new Alarm(scope, metricDetails.operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-majority-high-latency-impact` + nameSuffix,
            metric: new MathExpression({
                expression: "(m1 / m2)",
                usingMetrics: {
                    "m1": zonalLatency,
                    "m2": regionalLatency
                },
                period: metricDetails.period,
                label: availabilityZoneId + " percent high latency requests"
            }),
            threshold: outlierThreshold,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: TreatMissingData.IGNORE,
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
    static createServerSideInstancesHandlingRequestsInThisAZRule(
        scope: Construct, 
        operationName: string, 
        availabilityZoneId: string,
        ruleDetails: IContributorInsightRuleDetails, 
        counter: number,
        nameSuffix?: string) : CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";

        ruleBody.contribution = {
            keys: [ ruleDetails.instanceIdJsonPath ],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [ availabilityZoneId ]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [ operationName ]
                }
            ]
        } as unknown as IContributionDefinition;

        return new CfnInsightRule(scope, "AZ" + counter + "InstancesInTheAZRule", {
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
    static createServerSideInstanceFaultContributorsInThisAZRule(
        scope: Construct, 
        operationName: string, 
        availabilityZoneId: string, 
        ruleDetails: IContributorInsightRuleDetails,     
        counter: number,
        nameSuffix?: string
    ): CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ ruleDetails.instanceIdJsonPath ],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [ availabilityZoneId ]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [ operationName ]
                },
                {
                    "Match": ruleDetails.faultMetricJsonPath,
                    "GreaterThan": 0
                }
            ]
        } as unknown as IContributionDefinition;

        return new CfnInsightRule(scope, "AZ" + counter + "InstanceErrorContributionRule", {
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
    static createServerSideInstanceHighLatencyContributorsInThisAZRule(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        availabilityZoneId: string,
        ruleDetails: IContributorInsightRuleDetails,  
        counter: number,  
        nameSuffix?: string
    ): CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ ruleDetails.instanceIdJsonPath ],
            filters: [
                {
                    "Match": ruleDetails.availabilityZoneIdJsonPath,
                    "In": [ availabilityZoneId ]
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [ metricDetails.operationName ]
                },
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": metricDetails.successAlarmThreshold
                }
            ]
        } as unknown as IContributionDefinition;

        return new CfnInsightRule(scope, "AZ" + counter + "LatencyContributorsRule", {
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
    static createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        availabilityZoneId: string, 
        counter: number, 
        outlierThreshold: number,
        instanceFaultRateContributorsInThisAZ: CfnInsightRule,
        instancesHandlingRequestsInThisAZ: CfnInsightRule,
        nameSuffix?: string
    ) : IAlarm
    {
        return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForErrors", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-multiple-instances-faults` + nameSuffix,
            metric: new MathExpression({
                expression: `INSIGHT_RULE_METRIC(\"${instanceFaultRateContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
                period: metricDetails.period,
            }),
            evaluationPeriods: metricDetails.evaluationPeriods,
            threshold: outlierThreshold,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE
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
    static createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        availabilityZoneId: string,        
        counter: number, 
        outlierThreshold: number,
        instanceHighLatencyContributorsInThisAZ: CfnInsightRule,
        instancesHandlingRequestsInThisAZ: CfnInsightRule,
        nameSuffix?: string
    ) : IAlarm
    {
        return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForHighLatency", {
            alarmName: availabilityZoneId + `-${metricDetails.operationName.toLowerCase()}-multiple-instances-high-latency` + nameSuffix,
            metric: new MathExpression({
                expression: `INSIGHT_RULE_METRIC(\"${instanceHighLatencyContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
                period: metricDetails.period,
            }),
            evaluationPeriods: metricDetails.evaluationPeriods,
            threshold: outlierThreshold,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE
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
    static createCanaryIsolatedAZImpactAlarm(
        scope: Construct, 
        operationName: string, 
        availabilityZoneId: string,      
        counter: number, 
        azIsOutlierForFaultsAlarm: IAlarm,
        availabilityImpactAlarm: IAlarm,
        azIsOutlierForLatencyAlarm: IAlarm,
        latencyImpactAlarm: IAlarm,
        nameSuffix?: string, 
    ) : IAlarm
    {
        return new CompositeAlarm(scope, operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
            alarmRule: AlarmRule.anyOf(
                AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm), 
                AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm)
            ),
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
    static createServerSideIsolatedAZImpactAlarm(
        scope: Construct, 
        operationName: string, 
        availabilityZoneId: string,     
        counter: number, 
        azIsOutlierForFaultsAlarm: IAlarm,
        availabilityImpactAlarm: IAlarm,
        moreThanOneInstanceContributingToFaults: IAlarm,
        azIsOutlierForLatencyAlarm: IAlarm,
        latencyImpactAlarm: IAlarm,
        moreThanOneInstanceContributingToLatency: IAlarm,
        nameSuffix?: string, 
    ) : IAlarm
    {
        return new CompositeAlarm(scope, operationName + "AZ" + counter + "IsolatedImpactAlarm" + nameSuffix, {
            compositeAlarmName: availabilityZoneId + `-${operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
            alarmRule: AlarmRule.anyOf(
                (moreThanOneInstanceContributingToFaults === undefined || moreThanOneInstanceContributingToFaults == null) ? AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm) : AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm, moreThanOneInstanceContributingToFaults), 
                (moreThanOneInstanceContributingToLatency === undefined || moreThanOneInstanceContributingToLatency == null) ? AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm) : AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm, moreThanOneInstanceContributingToLatency)
            ),
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
    static createAggregateIsolatedAZImpactAlarm(
        scope: Construct, 
        operation: IOperation, 
        availabilityZoneId: string, 
        counter: number, 
        serverSideAlarm: IAlarm,
        canaryAlarm: IAlarm
    ) : IAlarm
    {
        return new CompositeAlarm(scope, operation.operationName + "AZ" + counter + "AggregateIsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-aggregate-isolated-impact-alarm`,
            alarmRule: AlarmRule.anyOf(serverSideAlarm, canaryAlarm),
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
    static createRegionalAvailabilityAlarm(scope: Construct, metricDetails: IOperationMetricDetails, nameSuffix: string) : IAlarm
    {
        return new Alarm(scope, metricDetails.operationName + "RegionalAvailabilityAlarm", {
            alarmName: Fn.ref("AWS::Region") + "-" + metricDetails.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric({
                label: Fn.ref("AWS::Region") + " availability",
                metricDetails: metricDetails,
                metricType: AvailabilityMetricType.SUCCESS_RATE
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
    static createRegionalLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, nameSuffix: string) : IAlarm
    {
        return new Alarm(scope, metricDetails.operationName + "RegionalLatencyAlarm", {
            alarmName: Fn.ref("AWS::Region") + "-" + metricDetails.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics({
                label: Fn.ref("AWS::Region") + " " + metricDetails.alarmStatistic + " latency",
                metricDetails: metricDetails,
                metricType: LatencyMetricType.SUCCESS_LATENCY,
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
    static createRegionalCustomerExperienceAlarm(scope: Construct, operationName: string, nameSuffix: string, regionalAvailabilityAlarm: IAlarm, regionalLatencyAlarm: IAlarm) : IAlarm
    {
        return new CompositeAlarm(scope, operationName + "RegionalCustomerExperienceAlarm",  {
            compositeAlarmName: Fn.ref("AWS::Region") + "-" + operationName.toLowerCase() + "-customer-experience-imact" + nameSuffix,
            alarmRule: AlarmRule.anyOf(regionalAvailabilityAlarm, regionalLatencyAlarm)
        });
    }

    static createRegionalInstanceContributorsToHighLatency(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        ruleDetails: IContributorInsightRuleDetails
    ) : CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ ruleDetails.instanceIdJsonPath ],
            filters: [
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": metricDetails.successAlarmThreshold
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [ metricDetails.operationName ]
                }
            ]
        } as unknown as IContributionDefinition;

        return new CfnInsightRule(scope, "RegionPerInstanceHighLatencyRule", {
            ruleName: Fn.ref("AWS::Region") + `-${metricDetails.operationName.toLowerCase()}-per-instance-high-latency-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }

    static createRegionalInstanceContributorsToFaults(
        scope: Construct, 
        metricDetails: IOperationMetricDetails, 
        ruleDetails: IContributorInsightRuleDetails
    ) : CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = {
            keys: [ ruleDetails.instanceIdJsonPath ],
            filters: [
                {
                    "Match": ruleDetails.successLatencyMetricJsonPath,
                    "GreaterThan": 0
                },
                {
                    "Match": ruleDetails.operationNameJsonPath,
                    "In": [ metricDetails.operationName ]
                }
            ]
        } as unknown as IContributionDefinition;

        return new CfnInsightRule(scope, "RegionPerInstanceErrorRule", {
            ruleName: Fn.ref("AWS::Region") + `-${metricDetails.operationName.toLowerCase()}-per-instance-faults-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.toJson()
        });
    }
}