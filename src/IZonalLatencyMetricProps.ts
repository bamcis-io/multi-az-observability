import { ILatencyMetricProps } from "./ILatencyMetricProps";

/**
 * The latency metric properties for an Availability Zone
 */
export interface IZonalLatencyMetricProps extends ILatencyMetricProps
{
    /**
     * The Availability Zone Id for the metrics
     */
    availabilityZoneId: string;

    /**
     * The Region for the metrics
     */
    region: string;
}