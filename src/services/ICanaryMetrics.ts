//import { IContributorInsightRuleDetails } from './IContributorInsightRuleDetails';
import { IOperationMetricDetails } from './IOperationMetricDetails';

/**
 * The metric definitions for metric produced by the canary
 */
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
}