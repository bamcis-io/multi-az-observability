import { ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ContributorInsightRuleDetails } from '../../services/ContributorInsightRuleDetails';
import { Operation } from '../../services/Operation';
import { OutlierDetectionAlgorithm } from '../../utilities/OutlierDetectionAlgorithm';

/**
 * The properties for the operation alarms and rules
 */
export interface OperationAlarmsAndRulesProps
{
  /**
     * The operation the alarms and rules are for
     */
  readonly operation: Operation;

  /**
     * The load balancer associated with this operation.
     *
     * @default - If not provided, its ARN will not be included
     * in top level alarm descriptions that can be referenced by
     * automation to identify which load balancers should execute
     * a zonal shift.
     */
  readonly loadBalancer?: ILoadBalancerV2;

  /**
     * Rule details for contributor insight rules
     */
  readonly contributorInsightRuleDetails?: ContributorInsightRuleDetails;

  /**
     * The outlier threshold used with the STATIC outlier detection algorithm
     */
  readonly outlierThreshold: number;

  /**
     * The outlier detection algorithm, currently only STATIC is supported
     */
  readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;
}