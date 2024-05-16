import { AddCanaryTestProps } from '../../canaries/props/AddCanaryTestProps';
import { ICanaryMetrics } from '../ICanaryMetrics';
import { IContributorInsightRuleDetails } from '../IContributorInsightRuleDetails';
import { IOperationMetricDetails } from '../IOperationMetricDetails';
import { IService } from '../IService';

/**
 * Properties for an operation
 */
export interface OperationProps
{
  /**
     * The service the operation is associated with
     */
  readonly service: IService;

  /**
     * The name of the operation
     */
  readonly operationName: string;

  /**
     *  The HTTP path for the operation for canaries
     *  to run against, something like "/products/list"
     */
  readonly path: string;

  /**
     * The server side availability metric details
     */
  readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;

  /**
     * The server side latency metric details
     */
  readonly serverSideLatencyMetricDetails: IOperationMetricDetails;

  /**
     * Optional metric details if the service has a canary
     *
     * @default - No alarms, rules, or dashboards will be created
     * from canary metrics
     */
  readonly canaryMetricDetails?: ICanaryMetrics;

  /**
     * The server side details for contributor insights rules
     *
     * @default - The default service contributor insight rule
     * details will be used. If those are not defined no Contributor Insight
     * rules will be created and the number of instances contributing to AZ
     * faults or high latency will not be considered, so a single bad instance
     * could make the AZ appear to look impaired.
     */
  readonly serverSideContributorInsightRuleDetails?: IContributorInsightRuleDetails;

  /**
     * Indicates this is a critical operation for the service
     * and will be included in service level metrics and
     * dashboards
     */
  readonly critical: boolean;

  /**
     * If you define this property, a synthetic
     * canary will be provisioned to test the operation.
     *
     * @default - The default for the service will be used, if that
     * is undefined, then no canary will be provisioned for this operation.
     */
  readonly canaryTestProps?: AddCanaryTestProps;


  /**
   * Set to true if you have defined CanaryTestProps for your
   * service, which applies to all operations, but you want to
   * opt out of creating the canary test for this operation.
   *
   * @default - The operation is not opted out
   */
  readonly optOutOfServiceCreatedCanary?: boolean;

  /**
     * The http methods supported by the operation
     */
  readonly httpMethods: string[];
}