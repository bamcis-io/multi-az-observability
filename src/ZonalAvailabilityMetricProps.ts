import { AvailabilityMetricType } from "./AvailabilityMetricType";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IZonalAvailabilityMetricProps } from "./IZonalAvailabilityMetricProps";
import { MetricScope } from "./MetricScope";
import { Fn } from "aws-cdk-lib";

/**
 * The availability metric properties for an Availability Zone
 */
export class ZonalAvailabilityMetricProps implements IZonalAvailabilityMetricProps
{
    /**
     * The Availability Zone id
     */
    availabilityZoneId: string;

    /**
     * The AWS Region
     */
    region: string = Fn.ref("AWS::Region");

    /**
     * The availability metric type
     */
    metricType: AvailabilityMetricType;

    /**
     * The availability metric details
     */
    metricDetails: IOperationMetricDetails;

    /**
     * The metric label
     */
    label: string;

    /**
     * The metric scope
     */
    metricScope: MetricScope = MetricScope.OPERATION_ZONAL;

    /**
     * (Optional) A key prefix for the metric id to make it unique in a graph or alarm
     */
    keyPrefix: string;
}