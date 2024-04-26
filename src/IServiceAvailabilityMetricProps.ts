import { IAvailabilityMetricProps } from "./IAvailabilityMetricProps";
import { Duration } from "aws-cdk-lib";

/**
 * Availability metric properties for a service
 */
export interface IServiceAvailabilityMetricProps 
{
    /**
     * The availability metric props for each operation in this service
     */
    availabilityMetricProps: IAvailabilityMetricProps[];

    /**
     * The metric label
     */
    label: string;

    /**
     * The period for the availability metrics
     */
    period: Duration;

    /**
     * (Optional) A key prefix for the metric id to make it unique in a graph or alarm
     */
    keyPrefix: string;
}