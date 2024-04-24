import { MetricWidgetProps, CfnInsightRule, LegendPosition } from "aws-cdk-lib/aws-cloudwatch"
import { Duration } from "aws-cdk-lib";

export interface ContributorInsightWidgetProps extends MetricWidgetProps
{
    /**
     * The account id for the widget
     */
    accountId: string;

    /**
     * The number of top contributors to graph
     */
    topContributors: number;

    /**
     * The insight rule for the widget
     */
    insightRule: CfnInsightRule;
    
    /**
     * The legend position in the widget
     */
    legendPosition: LegendPosition;

    /**
     * The order statistic used
     */
    orderStatistic: string;

    /**
     * The period for the widget data points
     */
    period: Duration;
}