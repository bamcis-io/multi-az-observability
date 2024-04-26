import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { MetricScope } from "./MetricScope";

/**
 * Common availability and latency metric props
 */
export interface IAvailabilityAndLatencyMetricProps
{
    /**
     * The metric details to create metrics from
     */
    metricDetails: IOperationMetricDetails;

    /**
     * The metric label
     */
    label: string;

    /**
     * The scope of the metric
     */
    metricScope: MetricScope;

    /**
     * (Optional) A key prefix for the metric name to make it unique
     * in alarms and graphs
     */
    keyPrefix: string;
}