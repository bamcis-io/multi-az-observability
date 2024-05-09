import { LatencyMetricProps } from "./LatencyMetricProps";

/**
 * The latency metric properties for an Availability Zone
 */
export interface ZonalLatencyMetricProps extends LatencyMetricProps
{
    /**
     * The Availability Zone Id for the metrics
     */
    readonly availabilityZoneId: string;
}