import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "./IOperationMetricDetails";

export interface ICanaryMetrics
{
        /**
     * The canary availability metric details
     */
        readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;

        /**
         * The canary latency metric details
         */
        readonly canaryLatencyMetricDetails: IOperationMetricDetails;
        
        /**
         * The canary details for contributor insights rules
         */
        readonly canaryContributorInsightRuleDetails?: IContributorInsightRuleDetails;
}