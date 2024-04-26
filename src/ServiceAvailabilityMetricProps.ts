import { Duration } from "aws-cdk-lib";
import { IAvailabilityMetricProps } from "./IAvailabilityMetricProps";
import { IServiceAvailabilityMetricProps } from "./IServiceAvailabilityMetricProps";

/**
 * The availability metric properties for a Service
 */
export class ServiceAvailabilityMetricProps implements IServiceAvailabilityMetricProps
{
    /**
     * The availability metric props for each operation in this service
     */
    availabilityMetricProps: IAvailabilityMetricProps[];

    /**
     * The lable for the metric
     */
    label: string;

    /**
     * The period for the metric
     */
    period: Duration;

    /**
     * (Optional) A key prefix for the metric id to make it unique in an alarm or graph
     */
    keyPrefix: string;
}