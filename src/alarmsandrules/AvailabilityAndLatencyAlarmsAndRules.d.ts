import { Construct } from "constructs";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { IOperationMetricDetails } from "../services/IOperationMetricDetails";
import { IOperation } from "../services/IOperation";
import { IContributorInsightRuleDetails } from "../services/IContributorInsightRuleDetails";
/**
 * Class used to create availability and latency alarms and Contributor Insight rules
 */
export declare class AvailabilityAndLatencyAlarmsAndRules {
    /**
     * Creates a zonal availability alarm
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createZonalAvailabilityAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, nameSuffix?: string): IAlarm;
    /**
     * Creates a zonal latency alarm
     * @param scope
     * @param metricDetails
     * @param availabilityZoneId
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createZonalLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, nameSuffix?: string): IAlarm;
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
    static createZonalAvailabilityOrLatencyCompositeAlarm(scope: Construct, operationName: string, availabilityZoneId: string, counter: number, zonalAvailabilityAlarm: IAlarm, zonalLatencyAlarm: IAlarm, nameSuffix?: string): IAlarm;
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
    static createZonalFaultRateOutlierAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, outlierThreshold: number, nameSuffix?: string): IAlarm;
    static createZonalHighLatencyOutlierAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, outlierThreshold: number, nameSuffix?: string): IAlarm;
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
    static createServerSideInstancesHandlingRequestsInThisAZRule(scope: Construct, operationName: string, availabilityZoneId: string, ruleDetails: IContributorInsightRuleDetails, counter: number, nameSuffix?: string): CfnInsightRule;
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
    static createServerSideInstanceFaultContributorsInThisAZRule(scope: Construct, operationName: string, availabilityZoneId: string, ruleDetails: IContributorInsightRuleDetails, counter: number, nameSuffix?: string): CfnInsightRule;
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
    static createServerSideInstanceHighLatencyContributorsInThisAZRule(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, ruleDetails: IContributorInsightRuleDetails, counter: number, nameSuffix?: string): CfnInsightRule;
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
    static createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, outlierThreshold: number, instanceFaultRateContributorsInThisAZ: CfnInsightRule, instancesHandlingRequestsInThisAZ: CfnInsightRule, nameSuffix?: string): IAlarm;
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
    static createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, availabilityZoneId: string, counter: number, outlierThreshold: number, instanceHighLatencyContributorsInThisAZ: CfnInsightRule, instancesHandlingRequestsInThisAZ: CfnInsightRule, nameSuffix?: string): IAlarm;
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
    static createCanaryIsolatedAZImpactAlarm(scope: Construct, operationName: string, availabilityZoneId: string, counter: number, azIsOutlierForFaultsAlarm: IAlarm, availabilityImpactAlarm: IAlarm, azIsOutlierForLatencyAlarm: IAlarm, latencyImpactAlarm: IAlarm, nameSuffix?: string): IAlarm;
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
    static createServerSideIsolatedAZImpactAlarm(scope: Construct, operationName: string, availabilityZoneId: string, counter: number, azIsOutlierForFaultsAlarm: IAlarm, availabilityImpactAlarm: IAlarm, moreThanOneInstanceContributingToFaults: IAlarm, azIsOutlierForLatencyAlarm: IAlarm, latencyImpactAlarm: IAlarm, moreThanOneInstanceContributingToLatency: IAlarm, nameSuffix?: string): IAlarm;
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
    static createAggregateIsolatedAZImpactAlarm(scope: Construct, operation: IOperation, availabilityZoneId: string, counter: number, serverSideAlarm: IAlarm, canaryAlarm: IAlarm): IAlarm;
    /**
     * Creates a regional availability alarm for the operation
     * @param scope
     * @param metricDetails
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createRegionalAvailabilityAlarm(scope: Construct, metricDetails: IOperationMetricDetails, nameSuffix: string): IAlarm;
    /**
     * Creates a regional latency alarm for the operation
     * @param scope
     * @param metricDetails
     * @param nameSuffix
     * @param counter
     * @returns
     */
    static createRegionalLatencyAlarm(scope: Construct, metricDetails: IOperationMetricDetails, nameSuffix: string): IAlarm;
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
    static createRegionalCustomerExperienceAlarm(scope: Construct, operationName: string, nameSuffix: string, regionalAvailabilityAlarm: IAlarm, regionalLatencyAlarm: IAlarm): IAlarm;
    static createRegionalInstanceContributorsToHighLatency(scope: Construct, metricDetails: IOperationMetricDetails, ruleDetails: IContributorInsightRuleDetails): CfnInsightRule;
    static createRegionalInstanceContributorsToFaults(scope: Construct, metricDetails: IOperationMetricDetails, ruleDetails: IContributorInsightRuleDetails): CfnInsightRule;
}
