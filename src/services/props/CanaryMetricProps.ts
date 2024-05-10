import { IContributorInsightRuleDetails } from '../IContributorInsightRuleDetails';
import { IOperationMetricDetails } from '../IOperationMetricDetails';

/**
 * Properties for canary metrics in an operation
 */
export interface CanaryMetricProps
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
     *
     * @default - No contributor insight rules will be created
     */
  readonly canaryContributorInsightRuleDetails?: IContributorInsightRuleDetails;
}