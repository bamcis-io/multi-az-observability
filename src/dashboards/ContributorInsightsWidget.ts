import { ConcreteWidget, IWidget} from "aws-cdk-lib/aws-cloudwatch";
import { IContributorInsightWidgetProps } from "./props/IContributorInsightWidgetProps";
import { Fn } from "aws-cdk-lib";

/**
 * A Contributor Insight dashboard widget
 */
export class ContributorInsightsWidget extends ConcreteWidget implements IWidget
{
    /**
     * The widget properties
     */
    properties: IContributorInsightWidgetProps;

    /**
     * Creates the widget
     * @param props 
     */
    constructor(props: IContributorInsightWidgetProps)
    {
        super(props.width === undefined ? 6 : props.width, props.height === undefined ? 6 : props.height)
        this.properties = props;
    } 

    /**
     * Converts the widget into an array of JSON objects (not string), this returns
     * a single item in the array
     * @returns An array of dictionaries
     */
    toJson(): any[] {
        return [ {
            "type": "metric",
            "width": this.width,
            "height": this.height,
            "x": this.x,
            "y": this.y,
            "properties": { 
                "insightRule": {
                    "maxContributorCount": this.properties.topContributors,
                    "orderBy": this.properties.orderStatistic,
                    "ruleName": this.properties.insightRule.attrRuleName
                }
            },
            "region": this.properties.region !== undefined ? this.properties.region : Fn.ref("AWS::Region"),
            "legend": {
                "position": this.properties.legendPosition
            },
            "view": "timeSeries",
            "period": this.properties.period.toSeconds(),
            "title": this.properties.title,
            "accountId": this.properties.accountId
        }];
    }
}