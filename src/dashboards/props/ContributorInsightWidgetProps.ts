import { MetricWidgetProps, CfnInsightRule, LegendPosition } from "aws-cdk-lib/aws-cloudwatch"
import { Duration } from "aws-cdk-lib";

/**
 * Properties for creating a contributor insight dashboard widget
 */
export interface ContributorInsightWidgetProps extends MetricWidgetProps
{
    /**
     * The account id for the widget
     */
    readonly accountId: string;

    /**
     * The number of top contributors to graph
     */
    readonly topContributors: number;

    /**
     * The insight rule for the widget
     */
    readonly insightRule: CfnInsightRule;
    
    /**
     * The legend position in the widget
     */
    readonly legendPosition: LegendPosition;

    /**
     * The order statistic used
     */
    readonly orderStatistic: string;

    /**
     * The period for the widget data points
     */
    readonly period: Duration;
}