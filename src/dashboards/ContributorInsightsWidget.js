"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributorInsightsWidget = void 0;
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_cdk_lib_1 = require("aws-cdk-lib");
/**
 * A Contributor Insight dashboard widget
 */
class ContributorInsightsWidget extends aws_cloudwatch_1.ConcreteWidget {
    /**
     * Creates the widget
     * @param props
     */
    constructor(props) {
        super(props.width === undefined ? 6 : props.width, props.height === undefined ? 6 : props.height);
        this.properties = props;
    }
    /**
     * Converts the widget into an array of JSON objects (not string), this returns
     * a single item in the array
     * @returns An array of dictionaries
     */
    toJson() {
        return [{
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
                "region": this.properties.region !== undefined ? this.properties.region : aws_cdk_lib_1.Fn.ref("AWS::Region"),
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
exports.ContributorInsightsWidget = ContributorInsightsWidget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJpYnV0b3JJbnNpZ2h0c1dpZGdldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbnRyaWJ1dG9ySW5zaWdodHNXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBQW9FO0FBRXBFLDZDQUFpQztBQUVqQzs7R0FFRztBQUNILE1BQWEseUJBQTBCLFNBQVEsK0JBQWM7SUFPekQ7OztPQUdHO0lBQ0gsWUFBWSxLQUFvQztRQUU1QyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakcsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNO1FBQ0YsT0FBTyxDQUFFO2dCQUNMLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDckIsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNYLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDWCxZQUFZLEVBQUU7b0JBQ1YsYUFBYSxFQUFFO3dCQUNYLHFCQUFxQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZTt3QkFDdEQsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYzt3QkFDekMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFlBQVk7cUJBQ3ZEO2lCQUNKO2dCQUNELFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7Z0JBQy9GLFFBQVEsRUFBRTtvQkFDTixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjO2lCQUM3QztnQkFDRCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDNUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSztnQkFDOUIsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUzthQUN6QyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE5Q0QsOERBOENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uY3JldGVXaWRnZXQsIElXaWRnZXR9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgQ29udHJpYnV0b3JJbnNpZ2h0V2lkZ2V0UHJvcHMgfSBmcm9tIFwiLi9wcm9wcy9Db250cmlidXRvckluc2lnaHRXaWRnZXRQcm9wc1wiO1xuaW1wb3J0IHsgRm4gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuLyoqXG4gKiBBIENvbnRyaWJ1dG9yIEluc2lnaHQgZGFzaGJvYXJkIHdpZGdldFxuICovXG5leHBvcnQgY2xhc3MgQ29udHJpYnV0b3JJbnNpZ2h0c1dpZGdldCBleHRlbmRzIENvbmNyZXRlV2lkZ2V0IGltcGxlbWVudHMgSVdpZGdldFxue1xuICAgIC8qKlxuICAgICAqIFRoZSB3aWRnZXQgcHJvcGVydGllc1xuICAgICAqL1xuICAgIHByb3BlcnRpZXM6IENvbnRyaWJ1dG9ySW5zaWdodFdpZGdldFByb3BzO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgd2lkZ2V0XG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBDb250cmlidXRvckluc2lnaHRXaWRnZXRQcm9wcylcbiAgICB7XG4gICAgICAgIHN1cGVyKHByb3BzLndpZHRoID09PSB1bmRlZmluZWQgPyA2IDogcHJvcHMud2lkdGgsIHByb3BzLmhlaWdodCA9PT0gdW5kZWZpbmVkID8gNiA6IHByb3BzLmhlaWdodClcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0gcHJvcHM7XG4gICAgfSBcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSB3aWRnZXQgaW50byBhbiBhcnJheSBvZiBKU09OIG9iamVjdHMgKG5vdCBzdHJpbmcpLCB0aGlzIHJldHVybnNcbiAgICAgKiBhIHNpbmdsZSBpdGVtIGluIHRoZSBhcnJheVxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGRpY3Rpb25hcmllc1xuICAgICAqL1xuICAgIHRvSnNvbigpOiBhbnlbXSB7XG4gICAgICAgIHJldHVybiBbIHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm1ldHJpY1wiLFxuICAgICAgICAgICAgXCJ3aWR0aFwiOiB0aGlzLndpZHRoLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICBcInhcIjogdGhpcy54LFxuICAgICAgICAgICAgXCJ5XCI6IHRoaXMueSxcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IFxuICAgICAgICAgICAgICAgIFwiaW5zaWdodFJ1bGVcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm1heENvbnRyaWJ1dG9yQ291bnRcIjogdGhpcy5wcm9wZXJ0aWVzLnRvcENvbnRyaWJ1dG9ycyxcbiAgICAgICAgICAgICAgICAgICAgXCJvcmRlckJ5XCI6IHRoaXMucHJvcGVydGllcy5vcmRlclN0YXRpc3RpYyxcbiAgICAgICAgICAgICAgICAgICAgXCJydWxlTmFtZVwiOiB0aGlzLnByb3BlcnRpZXMuaW5zaWdodFJ1bGUuYXR0clJ1bGVOYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmVnaW9uXCI6IHRoaXMucHJvcGVydGllcy5yZWdpb24gIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcGVydGllcy5yZWdpb24gOiBGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSxcbiAgICAgICAgICAgIFwibGVnZW5kXCI6IHtcbiAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCI6IHRoaXMucHJvcGVydGllcy5sZWdlbmRQb3NpdGlvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidmlld1wiOiBcInRpbWVTZXJpZXNcIixcbiAgICAgICAgICAgIFwicGVyaW9kXCI6IHRoaXMucHJvcGVydGllcy5wZXJpb2QudG9TZWNvbmRzKCksXG4gICAgICAgICAgICBcInRpdGxlXCI6IHRoaXMucHJvcGVydGllcy50aXRsZSxcbiAgICAgICAgICAgIFwiYWNjb3VudElkXCI6IHRoaXMucHJvcGVydGllcy5hY2NvdW50SWRcbiAgICAgICAgfV07XG4gICAgfVxufSJdfQ==