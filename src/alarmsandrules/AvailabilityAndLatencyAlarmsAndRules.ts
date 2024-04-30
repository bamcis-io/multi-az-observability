import { IOperationMetricDetails } from "../IOperationMetricDetails";
import { Construct } from "constructs";
import { IAlarm, Alarm, IMetric, CompositeAlarm, AlarmRule, MathExpression, CfnInsightRule, ComparisonOperator, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { ZonalAvailabilityMetricProps } from "../metrics/props/ZonalAvailabilityMetricProps";
import { IZonalAvailabilityMetricProps } from "../metrics/props/IZonalAvailabilityMetricProps";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { IZonalLatencyMetricProps } from "../metrics/props/IZonalLatencyMetricProps";
import { ZonalLatencyMetricProps } from "../metrics/props/ZonalLatencyMetricProps";
import { LatencyMetricType } from "../utilities/LatencyMetricType";
import { IOperation } from "../IOperation";
import { RegionalAvailabilityMetricProps } from "../metrics/props/RegionalAvailabilityMetricProps";
import { RegionalLatencyMetricProps } from "../metrics/props/RegionalLatencyMetricProps";
import { Fn } from "aws-cdk-lib";
import { ContributionDefinition, InsightRuleBody } from "./InsightRuleBody";
import { IRegionalAvailabilityMetricProps } from "../metrics/props/IRegionalAvailabilityMetricProps";
import { IRegionalLatencyMetricProps } from "../metrics/props/IRegionalLatencyMetricProps";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";

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
    static createZonalAvailabilityAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, nameSuffix: string, counter: number) : IAlarm
    {
        let props: IZonalAvailabilityMetricProps = new ZonalAvailabilityMetricProps();
        props.availabilityZoneId = availabilityZoneId;
        props.label = availabilityZoneId + " availability";
        props.metricDetails = metricDetails;
        props.metricType = AvailabilityMetricType.SUCCESS_RATE;

        return new Alarm(scope, metricDetails.operation.operationName + "AZ" + counter + "AvailabilityAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operation.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric(props)
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
    static createZonalLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, nameSuffix: string, counter: number) : IAlarm
    {
        let props: IZonalLatencyMetricProps = new ZonalLatencyMetricProps();
        props.availabilityZoneId = availabilityZoneId;
        props.label = availabilityZoneId + " " + metricDetails.alarmStatistic + " latency";
        props.metricDetails = metricDetails;
        props.metricType = LatencyMetricType.SUCCESS_LATENCY;
        props.statistic = metricDetails.alarmStatistic;

        return new Alarm(scope, metricDetails.operation.operationName + "AZ" + counter + "LatencyAlarm", {
            alarmName: availabilityZoneId + "-" + metricDetails.operation.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createZonalLatencyMetrics(props)[0]
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
    static createZonalAvailabilityOrLatencyCompositeAlarm(scope: Construct, operation: IOperation, availabilityZoneId: string, nameSuffix: string, counter: number, zonalAvailabilityAlarm: IAlarm, zonalLatencyAlarm: IAlarm): IAlarm 
    {
        return new CompositeAlarm(scope, "AZ" + counter + "ZonalImpactAlarm", {
            actionsEnabled: false,
            alarmDescription: availabilityZoneId + " has latency or availability impact. This does not indicate it is an outlier and shows isolated impact.",
            compositeAlarmName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-impact-aggregate-alarm` + nameSuffix,
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
    static createZonalFaultRateOutlierAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, nameSuffix: string, counter: number, outlierThreshold: number): IAlarm
    {
        let zonalProps = new ZonalAvailabilityMetricProps();
        zonalProps.availabilityZoneId = availabilityZoneId;
        zonalProps.label = "";
        zonalProps.metricDetails = metricDetails;
        zonalProps.metricType = AvailabilityMetricType.FAULT_COUNT;

        let zonalFaults: IMetric = AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric(zonalProps);

        let regionalProps = new RegionalAvailabilityMetricProps();
        regionalProps.label = "";
        regionalProps.metricDetails = metricDetails;
        regionalProps.metricType = AvailabilityMetricType.FAULT_COUNT;

        let regionalFaults: IMetric = AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric(regionalProps);

        return new Alarm(scope, "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operation.operationName.toLowerCase()}-majority-errors-impact` + nameSuffix,
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
        nameSuffix: string, 
        counter: number, 
        outlierThreshold: number): IAlarm
    {
        let zonalProps = new ZonalLatencyMetricProps();
        zonalProps.availabilityZoneId = availabilityZoneId;
        zonalProps.label = availabilityZoneId + "-" + metricDetails.operation.operationName + "-high-latency-requests";
        zonalProps.metricDetails = metricDetails;
        zonalProps.metricType = LatencyMetricType.SUCCESS_LATENCY;
        zonalProps.statistic = `TC(${metricDetails.successAlarmThreshold}:)`;

        let zonalLatency: IMetric = AvailabilityAndLatencyMetrics.createZonalLatencyMetrics(zonalProps)[0];

        let regionalProps = new RegionalLatencyMetricProps();
        regionalProps.label = Fn.ref("AWS::Region") + "-" + metricDetails.operation.operationName + "-high-latency-requests";
        regionalProps.metricDetails = metricDetails;
        regionalProps.metricType = LatencyMetricType.SUCCESS_LATENCY;
        regionalProps.statistic = `TC(${metricDetails.successAlarmThreshold}:)`;

        let regionalLatency: IMetric = AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics(regionalProps)[0];

        return new Alarm(scope, "AZ" + counter + "IsolatedImpactAlarm", {
            alarmName: availabilityZoneId + `-${metricDetails.operation.operationName.toLowerCase()}-majority-high-latency-impact` + nameSuffix,
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
        operation: IOperation, 
        availabilityZoneId: string,
        ruleDetails: IContributorInsightRuleDetails, 
        nameSuffix: string, 
        counter: number): CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = new ContributionDefinition();
        ruleBody.contribution.keys = [ ruleDetails.instanceIdJsonPath ];
        ruleBody.contribution.filters = [
            {
                "Match": ruleDetails.availabilityZoneIdJsonPath,
                "In": [ availabilityZoneId ]
            },
            {
                "Match": ruleDetails.operationNameJsonPath,
                "In": [ operation.operationName ]
            }
        ];

        return new CfnInsightRule(scope, "AZ" + counter + "InstancesInTheAZRule", {
            ruleName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-instances-in-the-az` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.ToJson()
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
        operation: IOperation, 
        availabilityZoneId: string, 
        ruleDetails: IContributorInsightRuleDetails,
        nameSuffix: string, 
        counter: number
    ): CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = new ContributionDefinition();
        ruleBody.contribution.keys = [ ruleDetails.instanceIdJsonPath ];
        ruleBody.contribution.filters = [
            {
                "Match": ruleDetails.availabilityZoneIdJsonPath,
                "In": [ availabilityZoneId ]
            },
            {
                "Match": ruleDetails.operationNameJsonPath,
                "In": [ operation.operationName ]
            },
            {
                "Match": ruleDetails.faultMetricJsonPath,
                "GreaterThan": 0
            }
        ];

        return new CfnInsightRule(scope, "AZ" + counter + "InstanceErrorContributionRule", {
            ruleName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-per-instance-faults` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.ToJson()
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
        nameSuffix: string, 
        counter: number,  
    ): CfnInsightRule
    {
        let ruleBody = new InsightRuleBody();
        ruleBody.logGroupNames = ruleDetails.logGroups.map(x => x.logGroupName);
        ruleBody.aggregateOn = "Count";
        ruleBody.contribution = new ContributionDefinition();
        ruleBody.contribution.keys = [ ruleDetails.instanceIdJsonPath ];
        ruleBody.contribution.filters = [
            {
                "Match": ruleDetails.availabilityZoneIdJsonPath,
                "In": [ availabilityZoneId ]
            },
            {
                "Match": ruleDetails.operationNameJsonPath,
                "In": [ metricDetails.operation.operationName ]
            },
            {
                "Match": ruleDetails.successLatencyMetricJsonPath,
                "GreaterThan": metricDetails.successAlarmThreshold
            }
        ];

        return new CfnInsightRule(scope, "AZ" + counter + "LatencyContributorsRule", {
            ruleName: availabilityZoneId + `-${metricDetails.operation.operationName.toLowerCase()}-per-instance-high-latency` + nameSuffix,
            ruleState: "ENABLED",
            ruleBody: ruleBody.ToJson()
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
        nameSuffix: string, 
        counter: number, 
        outlierThreshold: number,
        instanceFaultRateContributorsInThisAZ: CfnInsightRule,
        instancesHandlingRequestsInThisAZ: CfnInsightRule
    ) : IAlarm
    {
        return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForErrors", {
            alarmName: availabilityZoneId + `-${metricDetails.operation.operationName.toLowerCase()}-multiple-instances-faults` + nameSuffix,
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
        nameSuffix: string, 
        counter: number, 
        outlierThreshold: number,
        instanceHighLatencyContributorsInThisAZ: CfnInsightRule,
        instancesHandlingRequestsInThisAZ: CfnInsightRule
    ) : IAlarm
    {
        return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForHighLatency", {
            alarmName: availabilityZoneId + `-${metricDetails.operation.operationName.toLowerCase()}-multiple-instances-high-latency` + nameSuffix,
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
        operation: IOperation, 
        availabilityZoneId: string, 
        nameSuffix: string, 
        counter: number, 
        azIsOutlierForFaultsAlarm: IAlarm,
        availabilityImpactAlarm: IAlarm,
        azIsOutlierForLatencyAlarm: IAlarm,
        latencyImpactAlarm: IAlarm
    ) : IAlarm
    {
        return new CompositeAlarm(scope, operation.operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
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
        operation: IOperation, 
        availabilityZoneId: string, 
        nameSuffix: string, 
        counter: number, 
        azIsOutlierForFaultsAlarm: IAlarm,
        availabilityImpactAlarm: IAlarm,
        moreThanOneInstanceContributingToFaults: IAlarm,
        azIsOutlierForLatencyAlarm: IAlarm,
        latencyImpactAlarm: IAlarm,
        moreThanOneInstanceContributingToLatency: IAlarm
    ) : IAlarm
    {
        return new CompositeAlarm(scope, operation.operationName + "AZ" + counter + "IsolatedImpactAlarm", {
            compositeAlarmName: availabilityZoneId + `-${operation.operationName.toLowerCase()}-isolated-impact-alarm` + nameSuffix,
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
        let props: IRegionalAvailabilityMetricProps = new RegionalAvailabilityMetricProps();
        props.label = Fn.ref("AWS::Region") + " availability";
        props.metricDetails = metricDetails;
        props.metricType = AvailabilityMetricType.SUCCESS_RATE;

        return new Alarm(scope, metricDetails.operation.operationName + "RegionalAvailabilityAlarm", {
            alarmName: Fn.ref("AWS::Region") + "-" + metricDetails.operation.operationName.toLowerCase() + "-success-rate" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric(props)
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
        let props: IRegionalLatencyMetricProps = new RegionalLatencyMetricProps();
        props.label = Fn.ref("AWS::Region") + " " + metricDetails.alarmStatistic + " latency";
        props.metricDetails = metricDetails;
        props.metricType = LatencyMetricType.SUCCESS_LATENCY;
        props.statistic = metricDetails.alarmStatistic;

        return new Alarm(scope, metricDetails.operation.operationName + "RegionalLatencyAlarm", {
            alarmName: Fn.ref("AWS::Region") + "-" + metricDetails.operation.operationName.toLowerCase() + "-success-latency" + nameSuffix,
            evaluationPeriods: metricDetails.evaluationPeriods,
            datapointsToAlarm: metricDetails.datapointsToAlarm,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: metricDetails.successAlarmThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            metric: AvailabilityAndLatencyMetrics.createRegionalLatencyMetrics(props)[0]
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
    static createRegionalCustomerExperienceAlarm(scope: Construct, operation: IOperation, nameSuffix: string, regionalAvailabilityAlarm: IAlarm, regionalLatencyAlarm: IAlarm) : IAlarm
    {
        return new CompositeAlarm(scope, operation.operationName + "RegionalCustomerExperienceAlarm",  {
            compositeAlarmName: Fn.ref("AWS::Region") + "-" + operation.operationName.toLowerCase() + "-customer-experience-imact" + nameSuffix,
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
        ruleBody.contribution = new ContributionDefinition();
        ruleBody.contribution.keys = [ ruleDetails.instanceIdJsonPath ];
        ruleBody.contribution.filters = [
            {
                "Match": ruleDetails.successLatencyMetricJsonPath,
                "GreaterThan": metricDetails.successAlarmThreshold
            },
            {
                "Match": ruleDetails.operationNameJsonPath,
                "In": [ metricDetails.operation.operationName ]
            }
        ];

        return new CfnInsightRule(scope, "RegionPerInstanceHighLatencyRule", {
            ruleName: Fn.ref("AWS::Region") + `-${metricDetails.operation.operationName.toLowerCase()}-per-instance-high-latency-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.ToJson()
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
        ruleBody.contribution = new ContributionDefinition();
        ruleBody.contribution.keys = [ ruleDetails.instanceIdJsonPath ];
        ruleBody.contribution.filters = [
            {
                "Match": ruleDetails.successLatencyMetricJsonPath,
                "GreaterThan": 0
            },
            {
                "Match": ruleDetails.operationNameJsonPath,
                "In": [ metricDetails.operation.operationName ]
            }
        ];

        return new CfnInsightRule(scope, "RegionPerInstanceErrorRule", {
            ruleName: Fn.ref("AWS::Region") + `-${metricDetails.operation.operationName.toLowerCase()}-per-instance-faults-server`,
            ruleState: "ENABLED",
            ruleBody: ruleBody.ToJson()
        });
    }
}