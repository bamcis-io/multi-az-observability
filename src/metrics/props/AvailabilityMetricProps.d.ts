import { AvailabilityMetricType } from "../../utilities/AvailabilityMetricType";
import { AvailabilityAndLatencyMetricProps } from "./AvailabilityAndLatencyMetricProps";
/**
 * Metric properties for availability metrics
 */
export interface AvailabilityMetricProps extends AvailabilityAndLatencyMetricProps {
    /**
     * The type of availability metric
     */
    readonly metricType: AvailabilityMetricType;
}
