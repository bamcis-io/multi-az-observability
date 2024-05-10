"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanaryTest = void 0;
const constructs_1 = require("constructs");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const MultiAvailabilityZoneObservability_1 = require("../MultiAvailabilityZoneObservability");
class CanaryTest extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.timedEventRules = {};
        let azMapper = new MultiAvailabilityZoneObservability_1.AvailabilityZoneMapper(this, "AZMapper", {
            availabilityZoneNames: props.operation.service.availabilityZoneNames
        });
        this.metricNamespace = props.operation.canaryMetricDetails ? props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails.metricNamespace : "canary/metrics";
        props.operation.service.availabilityZoneNames.forEach((availabilityZoneName, index) => {
            let availabilityZoneId = azMapper.availabilityZoneId(availabilityZoneName);
            let scheme = props.operation.service.baseUrl.split(":")[0];
            let url = scheme + "://" + availabilityZoneName + "." + props.loadBalancer.loadBalancerDnsName + props.operation.path;
            let data = {
                "parameters": {
                    "methods": props.httpMethods !== undefined ? props.httpMethods : props.operation.httpMethods,
                    "url": url,
                    "postData": props.postData,
                    "headers": props.headers,
                    "operation": props.operation.operationName,
                    "faultBoundaryId": availabilityZoneId,
                    "faultBoundary": "az",
                    "metricNamespace": this.metricNamespace,
                    "requestCount": props.requestCount
                }
            };
            this.timedEventRules[availabilityZoneId] = new aws_events_1.Rule(this, "AZ" + index + props.operation.operationName + "TimedEvent", {
                schedule: aws_events_1.Schedule.expression(props.schedule),
                enabled: true,
                targets: [
                    new aws_events_targets_1.LambdaFunction(props.function, { event: aws_events_1.RuleTargetInput.fromObject(data) })
                ]
            });
        });
        let data = {
            "parameters": {
                "methods": props.httpMethods !== undefined ? props.httpMethods : props.operation.httpMethods,
                "url": props.operation.service.baseUrl.toString() + props.operation.path,
                "postData": props.postData,
                "headers": props.headers,
                "operation": props.operation.operationName,
                "faultBoundaryId": aws_cdk_lib_1.Fn.ref("AWS::Region"),
                "faultBoundary": "region",
                "metricNamespace": props.operation.canaryMetricDetails?.canaryAvailabilityMetricDetails.metricNamespace,
                "requestCount": props.requestCount
            }
        };
        this.timedEventRules[aws_cdk_lib_1.Fn.ref("AWS::Region")] = new aws_events_1.Rule(this, "RegionalTimedEvent", {
            schedule: aws_events_1.Schedule.expression(props.schedule),
            enabled: true,
            targets: [
                new aws_events_targets_1.LambdaFunction(props.function, { event: aws_events_1.RuleTargetInput.fromObject(data) })
            ]
        });
    }
}
exports.CanaryTest = CanaryTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuYXJ5VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNhbmFyeVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBRXZDLHVEQUFnRjtBQUNoRix1RUFBZ0U7QUFDaEUsNkNBQWlDO0FBQ2pDLDhGQUF3RztBQUV4RyxNQUFhLFVBQVcsU0FBUSxzQkFBUztJQU1yQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBRTVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFFMUIsSUFBSSxRQUFRLEdBQTRCLElBQUksMkRBQXNCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNqRixxQkFBcUIsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7U0FDdkUsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLCtCQUErQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7UUFFcEssS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDbEYsSUFBSSxrQkFBa0IsR0FBVyxRQUFRLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRixJQUFJLE1BQU0sR0FBWSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25FLElBQUksR0FBRyxHQUFXLE1BQU0sR0FBRyxLQUFLLEdBQUcsb0JBQW9CLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFFOUgsSUFBSSxJQUFJLEdBQXlCO2dCQUM3QixZQUFZLEVBQUU7b0JBQ1YsU0FBUyxFQUFFLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVc7b0JBQzVGLEtBQUssRUFBRSxHQUFHO29CQUNWLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUTtvQkFDMUIsU0FBUyxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUN4QixXQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhO29CQUMxQyxpQkFBaUIsRUFBRSxrQkFBa0I7b0JBQ3JDLGVBQWUsRUFBRSxJQUFJO29CQUNyQixpQkFBaUIsRUFBRSxJQUFJLENBQUMsZUFBZTtvQkFDdkMsY0FBYyxFQUFFLEtBQUssQ0FBQyxZQUFZO2lCQUNyQzthQUNKLENBQUE7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxpQkFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFlBQVksRUFBRTtnQkFDbkgsUUFBUSxFQUFFLHFCQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQzdDLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRTtvQkFDTCxJQUFJLG1DQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSw0QkFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2lCQUNqRjthQUNKLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLEdBQXlCO1lBQzdCLFlBQVksRUFBRTtnQkFDVixTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVztnQkFDNUYsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ3hFLFVBQVUsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDMUIsU0FBUyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN4QixXQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhO2dCQUMxQyxpQkFBaUIsRUFBRSxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7Z0JBQ3hDLGVBQWUsRUFBRSxRQUFRO2dCQUN6QixpQkFBaUIsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLCtCQUErQixDQUFDLGVBQWU7Z0JBQ3ZHLGNBQWMsRUFBRSxLQUFLLENBQUMsWUFBWTthQUNyQztTQUNKLENBQUE7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxpQkFBSSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUMvRSxRQUFRLEVBQUUscUJBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUM3QyxPQUFPLEVBQUUsSUFBSTtZQUNiLE9BQU8sRUFBRTtnQkFDTCxJQUFJLG1DQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSw0QkFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2FBQ2pGO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBcEVELGdDQW9FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDYW5hcnlUZXN0UHJvcHMgfSBmcm9tIFwiLi9wcm9wcy9DYW5hcnlUZXN0UHJvcHNcIjtcbmltcG9ydCB7IElSdWxlLCBSdWxlLCBSdWxlVGFyZ2V0SW5wdXQsIFNjaGVkdWxlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1ldmVudHNcIjtcbmltcG9ydCB7IExhbWJkYUZ1bmN0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0c1wiO1xuaW1wb3J0IHsgRm4gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXIsIElBdmFpbGFiaWxpdHlab25lTWFwcGVyIH0gZnJvbSBcIi4uL011bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHlcIjtcblxuZXhwb3J0IGNsYXNzIENhbmFyeVRlc3QgZXh0ZW5kcyBDb25zdHJ1Y3RcbntcbiAgICB0aW1lZEV2ZW50UnVsZXM6IHtba2V5OiBzdHJpbmddOiBJUnVsZX07XG5cbiAgICBtZXRyaWNOYW1lc3BhY2U6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDYW5hcnlUZXN0UHJvcHMpXG4gICAge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICB0aGlzLnRpbWVkRXZlbnRSdWxlcyA9IHt9O1xuXG4gICAgICAgIGxldCBhek1hcHBlcjogSUF2YWlsYWJpbGl0eVpvbmVNYXBwZXIgPSBuZXcgQXZhaWxhYmlsaXR5Wm9uZU1hcHBlcih0aGlzLCBcIkFaTWFwcGVyXCIsIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVOYW1lczogcHJvcHMub3BlcmF0aW9uLnNlcnZpY2UuYXZhaWxhYmlsaXR5Wm9uZU5hbWVzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubWV0cmljTmFtZXNwYWNlID0gcHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMgPyBwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscy5jYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLm1ldHJpY05hbWVzcGFjZSA6IFwiY2FuYXJ5L21ldHJpY3NcIjtcblxuICAgICAgICBwcm9wcy5vcGVyYXRpb24uc2VydmljZS5hdmFpbGFiaWxpdHlab25lTmFtZXMuZm9yRWFjaCgoYXZhaWxhYmlsaXR5Wm9uZU5hbWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBsZXQgYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcgPSBhek1hcHBlci5hdmFpbGFiaWxpdHlab25lSWQoYXZhaWxhYmlsaXR5Wm9uZU5hbWUpO1xuXG4gICAgICAgICAgICBsZXQgc2NoZW1lOiBzdHJpbmcgPSAgcHJvcHMub3BlcmF0aW9uLnNlcnZpY2UuYmFzZVVybC5zcGxpdChcIjpcIilbMF1cbiAgICAgICAgICAgIGxldCB1cmw6IHN0cmluZyA9IHNjaGVtZSArIFwiOi8vXCIgKyBhdmFpbGFiaWxpdHlab25lTmFtZSArIFwiLlwiICsgcHJvcHMubG9hZEJhbGFuY2VyLmxvYWRCYWxhbmNlckRuc05hbWUgKyBwcm9wcy5vcGVyYXRpb24ucGF0aDtcblxuICAgICAgICAgICAgbGV0IGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge1xuICAgICAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kc1wiOiBwcm9wcy5odHRwTWV0aG9kcyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaHR0cE1ldGhvZHMgOiBwcm9wcy5vcGVyYXRpb24uaHR0cE1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgXCJwb3N0RGF0YVwiOiBwcm9wcy5wb3N0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgXCJoZWFkZXJzXCI6IHByb3BzLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgICAgIFwib3BlcmF0aW9uXCI6IHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICBcImZhdWx0Qm91bmRhcnlJZFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgIFwiZmF1bHRCb3VuZGFyeVwiOiBcImF6XCIsXG4gICAgICAgICAgICAgICAgICAgIFwibWV0cmljTmFtZXNwYWNlXCI6IHRoaXMubWV0cmljTmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICBcInJlcXVlc3RDb3VudFwiOiBwcm9wcy5yZXF1ZXN0Q291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnRSdWxlc1thdmFpbGFiaWxpdHlab25lSWRdID0gbmV3IFJ1bGUodGhpcywgXCJBWlwiICsgaW5kZXggKyBwcm9wcy5vcGVyYXRpb24ub3BlcmF0aW9uTmFtZSArIFwiVGltZWRFdmVudFwiLCB7XG4gICAgICAgICAgICAgICAgc2NoZWR1bGU6IFNjaGVkdWxlLmV4cHJlc3Npb24ocHJvcHMuc2NoZWR1bGUpLFxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdGFyZ2V0czogWyBcbiAgICAgICAgICAgICAgICAgICAgbmV3IExhbWJkYUZ1bmN0aW9uKHByb3BzLmZ1bmN0aW9uLCB7IGV2ZW50OiBSdWxlVGFyZ2V0SW5wdXQuZnJvbU9iamVjdChkYXRhKX0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHtcbiAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJtZXRob2RzXCI6IHByb3BzLmh0dHBNZXRob2RzICE9PSB1bmRlZmluZWQgPyBwcm9wcy5odHRwTWV0aG9kcyA6IHByb3BzLm9wZXJhdGlvbi5odHRwTWV0aG9kcyxcbiAgICAgICAgICAgICAgICBcInVybFwiOiBwcm9wcy5vcGVyYXRpb24uc2VydmljZS5iYXNlVXJsLnRvU3RyaW5nKCkgKyBwcm9wcy5vcGVyYXRpb24ucGF0aCxcbiAgICAgICAgICAgICAgICBcInBvc3REYXRhXCI6IHByb3BzLnBvc3REYXRhLFxuICAgICAgICAgICAgICAgIFwiaGVhZGVyc1wiOiBwcm9wcy5oZWFkZXJzLFxuICAgICAgICAgICAgICAgIFwib3BlcmF0aW9uXCI6IHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lLFxuICAgICAgICAgICAgICAgIFwiZmF1bHRCb3VuZGFyeUlkXCI6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgICAgIFwiZmF1bHRCb3VuZGFyeVwiOiBcInJlZ2lvblwiLFxuICAgICAgICAgICAgICAgIFwibWV0cmljTmFtZXNwYWNlXCI6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzPy5jYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLm1ldHJpY05hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICBcInJlcXVlc3RDb3VudFwiOiBwcm9wcy5yZXF1ZXN0Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGltZWRFdmVudFJ1bGVzW0ZuLnJlZihcIkFXUzo6UmVnaW9uXCIpXSA9IG5ldyBSdWxlKHRoaXMsIFwiUmVnaW9uYWxUaW1lZEV2ZW50XCIsIHtcbiAgICAgICAgICAgIHNjaGVkdWxlOiBTY2hlZHVsZS5leHByZXNzaW9uKHByb3BzLnNjaGVkdWxlKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB0YXJnZXRzOiBbIFxuICAgICAgICAgICAgICAgIG5ldyBMYW1iZGFGdW5jdGlvbihwcm9wcy5mdW5jdGlvbiwgeyBldmVudDogUnVsZVRhcmdldElucHV0LmZyb21PYmplY3QoZGF0YSl9KVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG59Il19