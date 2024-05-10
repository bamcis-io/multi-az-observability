import { ConcreteWidget, IWidget } from "aws-cdk-lib/aws-cloudwatch";
import { ContributorInsightWidgetProps } from "./props/ContributorInsightWidgetProps";
/**
 * A Contributor Insight dashboard widget
 */
export declare class ContributorInsightsWidget extends ConcreteWidget implements IWidget {
    /**
     * The widget properties
     */
    properties: ContributorInsightWidgetProps;
    /**
     * Creates the widget
     * @param props
     */
    constructor(props: ContributorInsightWidgetProps);
    /**
     * Converts the widget into an array of JSON objects (not string), this returns
     * a single item in the array
     * @returns An array of dictionaries
     */
    toJson(): any[];
}
