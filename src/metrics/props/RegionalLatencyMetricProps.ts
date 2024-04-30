import { IOperationMetricDetails } from "../../IOperationMetricDetails";
import { IRegionalLatencyMetricProps } from "./IRegionalLatencyMetricProps";
import { LatencyMetricType } from "../../utilities/LatencyMetricType";
import { MetricScope } from "../../utilities/MetricScope";
import { Fn } from "aws-cdk-lib";

/**
 * The metric properties for Regional latency metrics
 */
export class RegionalLatencyMetricProps implements IRegionalLatencyMetricProps
{
    /**
     * The AWS Region
     */
    region: string = Fn.ref("AWS::Region");

    /**
     * The latency metric type
     */
    metricType: LatencyMetricType;

    /**
     * The latency statistic like p99, tm90, TC(100:)
     */
    statistic: string;

    /**
     * The latency metric details
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
     * (Optional) A key prefix to for the metric id to make it unique in an alarm or graph
     */
    keyPrefix: string;
    
}