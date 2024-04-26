import { ILatencyMetricProps } from "./ILatencyMetricProps";

/**
 * Metric properties for regional latency metrics
 */
export interface IRegionalLatencyMetricProps extends ILatencyMetricProps
{
    /**
     * The AWS Region
     */
    region: string;
}