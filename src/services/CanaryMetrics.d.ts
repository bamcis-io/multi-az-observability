import { ICanaryMetrics } from "./ICanaryMetrics";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { CanaryMetricProps } from "./props/CanaryMetricProps";
/**
 * Represents metrics for a canary testing a service
 */
export declare class CanaryMetrics implements ICanaryMetrics {
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
     *
     * @default - No contributor insights rules will be created for the
     * canary metrics
     */
    readonly canaryContributorInsightRuleDetails?: IContributorInsightRuleDetails;
    constructor(props: CanaryMetricProps);
}
