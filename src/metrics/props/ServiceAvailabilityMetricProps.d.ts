import { AvailabilityMetricProps } from "./AvailabilityMetricProps";
import { Duration } from "aws-cdk-lib";
/**
 * Availability metric properties for a service
 */
export interface ServiceAvailabilityMetricProps {
    /**
     * The availability metric props for each operation in this service
     */
    readonly availabilityMetricProps: AvailabilityMetricProps[];
    /**
     * The metric label
     */
    readonly label: string;
    /**
     * The period for the availability metrics
     */
    readonly period: Duration;
    /**
     * (Optional) A key prefix for the metric id to make it unique in a graph or alarm
     */
    readonly keyPrefix?: string;
}