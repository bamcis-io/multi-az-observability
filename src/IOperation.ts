import { IContributorInsightRuleDetails } from "./alarmsandrules/IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IService } from "./IService";

/**
 * Represents an operation that is part of a service and includes
 * details about its metrics and log files
 */
export interface IOperation 
{
    /**
     * The service the operation is part of
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
     * The canary availability metric details
     */
    canaryAvailabilityMetricDetails: IOperationMetricDetails;

    /**
     * The canary latency metric details
     */
    canaryLatencyMetricDetails: IOperationMetricDetails;

    /**
     * The canary details for contributor insights rules
     */
    canaryContributorInsightRuleDetails: IContributorInsightRuleDetails;

    /**
     * The server side details for contributor insights rules
     */
    serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
}