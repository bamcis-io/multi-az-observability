import { IBaseOperationRegionalAlarmsAndRulesProps } from "./IBaseOperationRegionalAlarmsAndRulesProps";
import { IContributorInsightRuleDetails } from "../IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "../../IOperationMetricDetails";

/**
 * Base properties for regional alarms and rules
 */
export abstract class BaseOperationRegionalAlarmsAndRulesProps implements IBaseOperationRegionalAlarmsAndRulesProps
{
    /**
     * The availability metric details
     */
    availabilityMetricDetails: IOperationMetricDetails;

    /**
     * The latency metric details
     */
    latencyMetricDetails: IOperationMetricDetails;

    /**
     * (Optional) A suffix to add to alarm and rule names
     */
    nameSuffix: string;

    /**
     * (Optional) Details for creating contributor insight rules, which help
     * make the server-side alarms for detecting single AZ failures more accurate
     */
    contributorInsightRuleDetails: IContributorInsightRuleDetails;
}