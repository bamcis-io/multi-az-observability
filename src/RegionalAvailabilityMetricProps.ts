import { AvailabilityMetricType } from "./AvailabilityMetricType";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IRegionalAvailabilityMetricProps } from "./IRegionalAvailabilityMetricProps";
import { MetricScope } from "./MetricScope";
import { Fn } from "aws-cdk-lib";

/**
 * The metric properties for regional availabiltiy metrics
 */
export class RegionalAvailabilityMetricProps implements IRegionalAvailabilityMetricProps
{
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
    metricScope: MetricScope = MetricScope.OPERATION_REGIONAL;

    /**
     * (Optional) A key prefix for the metric id to make it unique in an alarm or graph
     */
    keyPrefix: string;
}
