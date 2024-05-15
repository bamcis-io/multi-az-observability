
import { ICanaryMetrics } from './ICanaryMetrics';
import { IContributorInsightRuleDetails } from './IContributorInsightRuleDetails';
import { IOperation } from './IOperation';
import { IOperationMetricDetails } from './IOperationMetricDetails';
import { IService } from './IService';
import { OperationProps } from './props/OperationProps';
import { AddCanaryTestProps } from '../canaries/props/AddCanaryTestProps';

/**
 * A single operation that is part of a service
 */
export class Operation implements IOperation {
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
     */
  readonly canaryMetricDetails?: ICanaryMetrics;

  /**
    * The server side details for contributor insights rules
    */
  readonly serverSideContributorInsightRuleDetails?: IContributorInsightRuleDetails;

  /**
     * Indicates this is a critical operation for the service
     * and will be included in service level metrics and
     * dashboards
     */
  readonly critical: boolean;

  /**
     * The http methods supported by the operation
     */
  readonly httpMethods: string[];

  /**
     * If they have been added, the properties for
     * creating new canary tests on this operation
     */
  readonly canaryTestProps?: AddCanaryTestProps;

  constructor(props: OperationProps) {
    this.canaryMetricDetails = props.canaryMetricDetails;
    this.httpMethods = props.httpMethods;
    this.critical = props.critical;
    this.operationName = props.operationName;
    this.path = props.path;
    this.serverSideAvailabilityMetricDetails = props.serverSideAvailabilityMetricDetails;
    this.serverSideLatencyMetricDetails = props.serverSideLatencyMetricDetails;
    this.serverSideContributorInsightRuleDetails = props.serverSideContributorInsightRuleDetails;
    this.service = props.service;
    this.canaryTestProps = props.canaryTestProps;
  }
}