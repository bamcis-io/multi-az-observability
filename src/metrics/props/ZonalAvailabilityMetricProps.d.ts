import { AvailabilityMetricProps } from "./AvailabilityMetricProps";
/**
 * The Availability Zone availability metric properties
 */
export interface ZonalAvailabilityMetricProps extends AvailabilityMetricProps {
    /**
     * The Availability Zone Id for the metrics
     */
    readonly availabilityZoneId: string;
}
