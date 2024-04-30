import { IContributorInsightRuleDetails } from "../IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "../../IOperationMetricDetails";

/**
 * The base props for an operation regional alarms and rules configuration
 */
export interface IBaseOperationRegionalAlarmsAndRulesProps
{
    /**
     * The metric details for availability metrics
     */
    availabilityMetricDetails: IOperationMetricDetails;

    /**
     * The metric details for latency metrics
     */
    latencyMetricDetails: IOperationMetricDetails;

    /**
     * (Optional) A suffix to be appended to alarm and rule names
     */
    nameSuffix: string;

    /**
     * (Optional) Details for creating contributor insight rules, which help
     * make the server-side alarms for detecting single AZ failures more accurate
     */
    contributorInsightRuleDetails: IContributorInsightRuleDetails;
}