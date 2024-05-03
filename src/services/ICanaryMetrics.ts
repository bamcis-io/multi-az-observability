import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "./IOperationMetricDetails";

/**
 * Represents metrics for a canary testing a service
 */
export interface ICanaryMetrics
{
    /**
     * The canary availability metric details
     */
    canaryAvailabilityMetricDetails: IOperationMetricDetails;

    /**
     * The canary latency metric details
     */
    canaryLatencyMetricDetails: IOperationMetricDetails;
    
    /**
     * The canary details for contributor insights rules
     */
    canaryContributorInsightRuleDetails?: IContributorInsightRuleDetails;
}