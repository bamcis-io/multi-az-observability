import { ICanaryMetrics } from "./ICanaryMetrics";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IService } from "./IService";

export interface IOperation
{
    /**
     * The service the operation is associated with
     */
    service: IService;

    /**
     * The name of the operation
     */
    operationName: string;

    /**
     *  The HTTP path for the operation for canaries
     *  to run against, something like "/products/list"
     */
    path: string;

    /**
     * The server side availability metric details
     */
    serverSideAvailabilityMetricDetails: IOperationMetricDetails;

    /**
     * The server side latency metric details
     */
    serverSideLatencyMetricDetails: IOperationMetricDetails;

    /**
     * Optional metric details if the service has a canary
     */
    canaryMetricDetails?: ICanaryMetrics;

     /**
     * The server side details for contributor insights rules
     */
     serverSideContributorInsightRuleDetails?: IContributorInsightRuleDetails;
}