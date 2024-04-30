import { AvailabilityMetricType } from "../../utilities/AvailabilityMetricType";
import { IAvailabilityAndLatencyMetricProps } from "./IAvailabilityAndLatencyMetricProps";

/**
 * Metric properties for availability metrics
 */
export interface IAvailabilityMetricProps extends IAvailabilityAndLatencyMetricProps
{
    /**
     * The type of availability metric
     */
    metricType: AvailabilityMetricType;
}