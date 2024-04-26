import { IAvailabilityAndLatencyMetricProps } from "./IAvailabilityAndLatencyMetricProps";
import { LatencyMetricType } from "./LatencyMetricType";

/**
 * Metric properties for latency metrics
 */
export interface ILatencyMetricProps extends IAvailabilityAndLatencyMetricProps
{
    /**
     * The type of latency metric
     */
    metricType: LatencyMetricType;

    /**
     * The latency statistic like p99, tm99, or TC(100:)
     */
    statistic: string;
}