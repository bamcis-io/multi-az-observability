import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IZonalLatencyMetricProps } from "./IZonalLatencyMetricProps";
import { LatencyMetricType } from "./LatencyMetricType";
import { MetricScope } from "./MetricScope";
import { Fn } from "aws-cdk-lib";

/**
 * The latency metric properties for the Availability Zone
 */
export class ZonalLatencyMetricProps implements IZonalLatencyMetricProps
{
    /**
     * The Availability Zone Id
     */
    availabilityZoneId: string;

    /**
     * The AWS Region
     */
    region: string = Fn.ref("AWS::Region")

    /**
     * The latency metric details
     */
    metricType: LatencyMetricType;

    /**
     * The latency statistic to create for the metric, like p99, tm90, TC(100:)
     */
    statistic: string;

    /**
     * The latency metric details
     */
    metricDetails: IOperationMetricDetails;

    /**
     * The label for the metric
     */
    label: string;

    /**
     * The metric scope
     */
    metricScope: MetricScope = MetricScope.OPERATION_ZONAL;

    /**
     * (Optional) A key prefix for the metric id to make it unique in an alarm or graph
     */
    keyPrefix: string;
}