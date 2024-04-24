import { ConcreteWidget, IWidget} from "aws-cdk-lib/aws-cloudwatch";
import { ContributorInsightWidgetProps } from "./ContributorInsightWidgetProps";
import { Fn } from "aws-cdk-lib";

export class ContributorInsightsWidget extends ConcreteWidget implements IWidget
{
    properties: ContributorInsightWidgetProps;

    constructor(props: ContributorInsightWidgetProps)
    {
        super(props.width === undefined ? 6 : props.width, props.height === undefined ? 6 : props.height)
        this.properties = props;
    } 

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