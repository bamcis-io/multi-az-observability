import { IAvailabilityMetricProps } from "./IAvailabilityMetricProps";

/**
 * The Availability Zone availability metric properties
 */
export interface IZonalAvailabilityMetricProps extends IAvailabilityMetricProps
{
    /**
     * The Availability Zone Id for the metrics
     */
    availabilityZoneId: string;
}