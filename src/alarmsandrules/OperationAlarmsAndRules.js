"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationAlarmsAndRules = void 0;
const constructs_1 = require("constructs");
const ServerSideOperationRegionalAlarmsAndRules_1 = require("./ServerSideOperationRegionalAlarmsAndRules");
const CanaryOperationRegionalAlarmsAndRules_1 = require("./CanaryOperationRegionalAlarmsAndRules");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ServerSideOperationZonalAlarmsAndRules_1 = require("./ServerSideOperationZonalAlarmsAndRules");
const MultiAvailabilityZoneObservability_1 = require("../MultiAvailabilityZoneObservability");
/**
 * Creates alarms and rules for an operation for both regional and zonal metrics
 */
class OperationAlarmsAndRules extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.serverSideZonalAlarmsAndRules = [];
        this.canaryZonalAlarmsAndRules = [];
        this.aggregateZonalAlarms = [];
        this.operation = props.operation;
        let azMapper = new MultiAvailabilityZoneObservability_1.AvailabilityZoneMapper(this, "AZMapper", {
            availabilityZoneNames: props.operation.service.availabilityZoneNames
        });
        let loadBalancerArn = props.loadBalancer.loadBalancerArn;
        this.serverSideRegionalAlarmsAndRules = new ServerSideOperationRegionalAlarmsAndRules_1.ServerSideOperationRegionalAlarmsAndRules(this, props.operation.operationName + "ServerSideRegionalAlarms", {
            availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
            latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
            contributorInsightRuleDetails: props.operation.serverSideContributorInsightRuleDetails,
            nameSuffix: "-server"
        });
        if (props.operation.canaryMetricDetails !== undefined && props.operation.canaryMetricDetails != null) {
            this.canaryRegionalAlarmsAndRules = new CanaryOperationRegionalAlarmsAndRules_1.CanaryOperationRegionalAlarmsAndRules(this, props.operation.operationName + "CanaryRegionalAlarms", {
                availabilityMetricDetails: props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
                contributorInsightRuleDetails: props.operation.canaryMetricDetails.canaryContributorInsightRuleDetails,
                nameSuffix: "-canary"
            });
        }
        if (this.canaryRegionalAlarmsAndRules !== undefined) {
            this.aggregateRegionalAlarm = new aws_cloudwatch_1.CompositeAlarm(this, props.operation.operationName + "AggregateRegionalAlarm", {
                actionsEnabled: false,
                compositeAlarmName: aws_cdk_lib_1.Fn.ref("AWS::Region") + "-" + props.operation.operationName.toLowerCase() + "-" + "aggregate-alarm",
                alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm, this.canaryRegionalAlarmsAndRules.availabilityOrLatencyAlarm)
            });
        }
        else {
            this.aggregateRegionalAlarm = this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm;
        }
        let counter = 1;
        for (let i = 0; i < props.operation.service.availabilityZoneNames.length; i++) {
            let availabilityZoneId = azMapper.availabilityZoneId(props.operation.service.availabilityZoneNames[i]);
            this.serverSideZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules_1.ServerSideOperationZonalAlarmsAndRules(this, props.operation.operationName + "AZ" + counter + "ServerSideZonalAlarmsAndRules", {
                availabilityZoneId: availabilityZoneId,
                availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
                contributorInsightRuleDetails: props.operation.serverSideContributorInsightRuleDetails,
                counter: counter,
                outlierThreshold: props.outlierThreshold,
                outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
                nameSuffix: "-server",
                operation: props.operation
            }));
            if (props.operation.canaryMetricDetails !== undefined && props.operation.canaryMetricDetails != null) {
                this.canaryZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules_1.ServerSideOperationZonalAlarmsAndRules(this, props.operation.operationName + "AZ" + counter + "CanaryZonalAlarmsAndRules", {
                    availabilityZoneId: availabilityZoneId,
                    availabilityMetricDetails: props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails,
                    latencyMetricDetails: props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
                    contributorInsightRuleDetails: props.operation.canaryMetricDetails.canaryContributorInsightRuleDetails,
                    counter: counter,
                    outlierThreshold: props.outlierThreshold,
                    outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
                    nameSuffix: "-canary",
                    operation: props.operation
                }));
                this.aggregateZonalAlarms.push(new aws_cloudwatch_1.CompositeAlarm(this, props.operation.operationName + "AZ" + counter + "AggregateZonalIsolatedImpactAlarm", {
                    compositeAlarmName: availabilityZoneId + "-" + props.operation.operationName.toLowerCase() + "-aggregate-isolated-az-impact",
                    alarmRule: aws_cloudwatch_1.AlarmRule.anyOf(this.canaryZonalAlarmsAndRules[i].isolatedImpactAlarm, this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm),
                    actionsEnabled: false,
                    alarmDescription: "{\"loadBalancer\":\"" + loadBalancerArn + "\",\"az-id\":\"" + availabilityZoneId + "\"}"
                }));
            }
            else {
                this.aggregateZonalAlarms.push(this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm);
            }
            counter++;
        }
    }
}
exports.OperationAlarmsAndRules = OperationAlarmsAndRules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPcGVyYXRpb25BbGFybXNBbmRSdWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFDdkMsMkdBQXdHO0FBQ3hHLG1HQUFnRztBQUdoRywrREFBK0U7QUFDL0UsNkNBQWlDO0FBQ2pDLHFHQUFrRztBQU9sRyw4RkFBd0c7QUFFeEc7O0dBRUc7QUFDSCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBeUNsRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW1DO1FBRXpFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLDZCQUE2QixHQUFHLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMseUJBQXlCLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBRWpDLElBQUksUUFBUSxHQUE0QixJQUFJLDJEQUFzQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDakYscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCO1NBQ3ZFLENBQUMsQ0FBQztRQUVILElBQUksZUFBZSxHQUFJLEtBQUssQ0FBQyxZQUFpQyxDQUFDLGVBQWUsQ0FBQztRQUUvRSxJQUFJLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxxRkFBeUMsQ0FDakYsSUFBSSxFQUNKLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLDBCQUEwQixFQUMxRDtZQUNJLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsbUNBQW1DO1lBQzlFLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsOEJBQThCO1lBQ3BFLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxT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LGVBQWUsR0FBRyxpQkFBaUIsR0FBRyxrQkFBa0IsR0FBRyxLQUFLO2lCQUM5RyxDQUNKLENBQUMsQ0FBQztZQUNQLENBQUM7aUJBRUQsQ0FBQztnQkFDRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBQzdGLENBQUM7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUF4SkQsMERBd0pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IFNlcnZlclNpZGVPcGVyYXRpb25SZWdpb25hbEFsYXJtc0FuZFJ1bGVzIH0gZnJvbSBcIi4vU2VydmVyU2lkZU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IENhbmFyeU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMgfSBmcm9tIFwiLi9DYW5hcnlPcGVyYXRpb25SZWdpb25hbEFsYXJtc0FuZFJ1bGVzXCI7XG5pbXBvcnQgeyBJT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXMgfSBmcm9tIFwiLi9JT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IEJhc2VMb2FkQmFsYW5jZXIgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcbmltcG9ydCB7IEFsYXJtUnVsZSwgQ29tcG9zaXRlQWxhcm0sIElBbGFybSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgRm4gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IFNlcnZlclNpZGVPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzIH0gZnJvbSBcIi4vU2VydmVyU2lkZU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IElTZXJ2ZXJTaWRlT3BlcmF0aW9uUmVnaW9uYWxBbGFybXNBbmRSdWxlcyB9IGZyb20gXCIuL0lTZXJ2ZXJTaWRlT3BlcmF0aW9uUmVnaW9uYWxBbGFybXNBbmRSdWxlc1wiO1xuaW1wb3J0IHsgSUNhbmFyeU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMgfSBmcm9tIFwiLi9JQ2FuYXJ5T3BlcmF0aW9uUmVnaW9uYWxBbGFybXNBbmRSdWxlc1wiO1xuaW1wb3J0IHsgSUNhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXMgfSBmcm9tIFwiLi9JQ2FuYXJ5T3BlcmF0aW9uWm9uYWxBbGFybXNBbmRSdWxlc1wiO1xuaW1wb3J0IHsgSVNlcnZlclNpZGVPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzIH0gZnJvbSBcIi4vSVNlcnZlclNpZGVPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzXCI7XG5pbXBvcnQgeyBPcGVyYXRpb25BbGFybXNBbmRSdWxlc1Byb3BzIH0gZnJvbSBcIi4vcHJvcHMvT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNQcm9wc1wiO1xuaW1wb3J0IHsgSU9wZXJhdGlvbiB9IGZyb20gXCIuLi9zZXJ2aWNlcy9JT3BlcmF0aW9uXCI7XG5pbXBvcnQgeyBBdmFpbGFiaWxpdHlab25lTWFwcGVyLCBJQXZhaWxhYmlsaXR5Wm9uZU1hcHBlciB9IGZyb20gXCIuLi9NdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5XCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhbGFybXMgYW5kIHJ1bGVzIGZvciBhbiBvcGVyYXRpb24gZm9yIGJvdGggcmVnaW9uYWwgYW5kIHpvbmFsIG1ldHJpY3NcbiAqL1xuZXhwb3J0IGNsYXNzIE9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzIGV4dGVuZHMgQ29uc3RydWN0IGltcGxlbWVudHMgSU9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzXG57XG4gICAgLyoqXG4gICAgICogVGhlIG9wZXJhdGlvbiB0aGUgYWxhcm1zIGFuZCBydWxlcyBhcmUgY3JlYXRlZCBmb3JcbiAgICAgKi9cbiAgICBvcGVyYXRpb246IElPcGVyYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VydmVyIHNpZGUgcmVnaW9uYWwgYWxhcm1zIGFuZCBydWxlc1xuICAgICAqL1xuICAgIHNlcnZlclNpZGVSZWdpb25hbEFsYXJtc0FuZFJ1bGVzOiBJU2VydmVyU2lkZU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXM7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FuYXJ5IHJlZ2lvbmFsIGFsYXJtcyBhbmQgcnVsZXNcbiAgICAgKi9cbiAgICBjYW5hcnlSZWdpb25hbEFsYXJtc0FuZFJ1bGVzPzogSUNhbmFyeU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXM7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYWdncmVnYXRlIHJlZ2lvbmFsIGFsYXJtIHRoYXQgbG9va3MgYXQgYm90aCBjYW5hcnkgYW5kIHNlcnZlclxuICAgICAqIHNpZGUgaW1wYWN0IGFsYXJtcyBmb3IgbGF0ZW5jeSBhbmQgYXZhaWxhYmlsaXR5XG4gICAgICovXG4gICAgYWdncmVnYXRlUmVnaW9uYWxBbGFybTogSUFsYXJtO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlcnZlciBzaWRlIHpvbmFsIGFsYXJtcyBhbmQgcnVsZXNcbiAgICAgKi9cbiAgICBzZXJ2ZXJTaWRlWm9uYWxBbGFybXNBbmRSdWxlczogSVNlcnZlclNpZGVPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FuYXJ5IHpvbmFsIGFsYXJtcyBhbmQgcnVsZXNcbiAgICAgKi9cbiAgICBjYW5hcnlab25hbEFsYXJtc0FuZFJ1bGVzOiBJQ2FuYXJ5T3BlcmF0aW9uWm9uYWxBbGFybXNBbmRSdWxlc1tdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFnZ3JlZ2F0ZSB6b25hbCBhbGFybXMsIG9uZSBwZXIgQVouIEVhY2ggYWxhcm0gaW5kaWNhdGVzIHRoZXJlIGlzIGVpdGhlclxuICAgICAqIGxhdGVuY3kgb3IgYXZhaWxhYmlsaXR5IGltcGFjdCBpbiB0aGF0IEFaLCBhbmQgdGhlIEFaIGlzIGFuIG91dGxpZXIgZm9yXG4gICAgICogYXZhaWxhYmlsaXR5IG9yIGxhdGVuY3kgaW1wYWN0LiBCb3RoIHNlcnZlciBzaWRlIGFuZCBjYW5hcnkgbWV0cmljcyBhcmVcbiAgICAgKiBldmFsdWF0ZWRcbiAgICAgKi9cbiAgICBhZ2dyZWdhdGVab25hbEFsYXJtczogSUFsYXJtW107XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNQcm9wcylcbiAgICB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgICAgIHRoaXMuc2VydmVyU2lkZVpvbmFsQWxhcm1zQW5kUnVsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5jYW5hcnlab25hbEFsYXJtc0FuZFJ1bGVzID0gW107XG4gICAgICAgIHRoaXMuYWdncmVnYXRlWm9uYWxBbGFybXMgPSBbXTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBwcm9wcy5vcGVyYXRpb247XG5cbiAgICAgICAgbGV0IGF6TWFwcGVyOiBJQXZhaWxhYmlsaXR5Wm9uZU1hcHBlciA9IG5ldyBBdmFpbGFiaWxpdHlab25lTWFwcGVyKHRoaXMsIFwiQVpNYXBwZXJcIiwge1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiBwcm9wcy5vcGVyYXRpb24uc2VydmljZS5hdmFpbGFiaWxpdHlab25lTmFtZXNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGxvYWRCYWxhbmNlckFybiA9IChwcm9wcy5sb2FkQmFsYW5jZXIgYXMgQmFzZUxvYWRCYWxhbmNlcikubG9hZEJhbGFuY2VyQXJuO1xuXG4gICAgICAgIHRoaXMuc2VydmVyU2lkZVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMgPSBuZXcgU2VydmVyU2lkZU9wZXJhdGlvblJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMoXG4gICAgICAgICAgICB0aGlzLCBcbiAgICAgICAgICAgIHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJTZXJ2ZXJTaWRlUmVnaW9uYWxBbGFybXNcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHMsXG4gICAgICAgICAgICAgICAgbmFtZVN1ZmZpeDogXCItc2VydmVyXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAocHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMgIT09IHVuZGVmaW5lZCAmJiBwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscyAhPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmNhbmFyeVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMgPSBuZXcgQ2FuYXJ5T3BlcmF0aW9uUmVnaW9uYWxBbGFybXNBbmRSdWxlcyhcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJDYW5hcnlSZWdpb25hbEFsYXJtc1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5TWV0cmljRGV0YWlsczogcHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMuY2FuYXJ5QXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlsczogcHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMuY2FuYXJ5Q29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgIG5hbWVTdWZmaXg6IFwiLWNhbmFyeVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNhbmFyeVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMgIT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVSZWdpb25hbEFsYXJtID0gbmV3IENvbXBvc2l0ZUFsYXJtKHRoaXMsIHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJBZ2dyZWdhdGVSZWdpb25hbEFsYXJtXCIsIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29tcG9zaXRlQWxhcm1OYW1lOiBGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiLVwiICsgcHJvcHMub3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKSArIFwiLVwiICsgXCJhZ2dyZWdhdGUtYWxhcm1cIixcbiAgICAgICAgICAgICAgICBhbGFybVJ1bGU6IEFsYXJtUnVsZS5hbnlPZih0aGlzLnNlcnZlclNpZGVSZWdpb25hbEFsYXJtc0FuZFJ1bGVzLmF2YWlsYWJpbGl0eU9yTGF0ZW5jeUFsYXJtLCB0aGlzLmNhbmFyeVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMuYXZhaWxhYmlsaXR5T3JMYXRlbmN5QWxhcm0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYWdncmVnYXRlUmVnaW9uYWxBbGFybSA9IHRoaXMuc2VydmVyU2lkZVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMuYXZhaWxhYmlsaXR5T3JMYXRlbmN5QWxhcm07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY291bnRlcjogbnVtYmVyID0gMTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLm9wZXJhdGlvbi5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nID0gYXpNYXBwZXIuYXZhaWxhYmlsaXR5Wm9uZUlkKHByb3BzLm9wZXJhdGlvbi5zZXJ2aWNlLmF2YWlsYWJpbGl0eVpvbmVOYW1lc1tpXSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2VydmVyU2lkZVpvbmFsQWxhcm1zQW5kUnVsZXMucHVzaChuZXcgU2VydmVyU2lkZU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXMoXG4gICAgICAgICAgICAgICAgdGhpcywgXG4gICAgICAgICAgICAgICAgcHJvcHMub3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUgKyBcIkFaXCIgKyBjb3VudGVyICsgXCJTZXJ2ZXJTaWRlWm9uYWxBbGFybXNBbmRSdWxlc1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uc2VydmVyU2lkZUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyOiBjb3VudGVyLFxuICAgICAgICAgICAgICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiBwcm9wcy5vdXRsaWVyVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICBvdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtOiBwcm9wcy5vdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtLFxuICAgICAgICAgICAgICAgICAgICBuYW1lU3VmZml4OiBcIi1zZXJ2ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uOiBwcm9wcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzICE9PSB1bmRlZmluZWQgJiYgcHJvcHMub3BlcmF0aW9uLmNhbmFyeU1ldHJpY0RldGFpbHMgIT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmFyeVpvbmFsQWxhcm1zQW5kUnVsZXMucHVzaChuZXcgU2VydmVyU2lkZU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXMoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsIFxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vcGVyYXRpb24ub3BlcmF0aW9uTmFtZSArIFwiQVpcIiArIGNvdW50ZXIgKyBcIkNhbmFyeVpvbmFsQWxhcm1zQW5kUnVsZXNcIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBwcm9wcy5vcGVyYXRpb24uY2FuYXJ5TWV0cmljRGV0YWlscy5jYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF0ZW5jeU1ldHJpY0RldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM6IHByb3BzLm9wZXJhdGlvbi5jYW5hcnlNZXRyaWNEZXRhaWxzLmNhbmFyeUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlcjogY291bnRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpZXJUaHJlc2hvbGQ6IHByb3BzLm91dGxpZXJUaHJlc2hvbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtOiBwcm9wcy5vdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZVN1ZmZpeDogXCItY2FuYXJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IHByb3BzLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFnZ3JlZ2F0ZVpvbmFsQWxhcm1zLnB1c2gobmV3IENvbXBvc2l0ZUFsYXJtKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLCBcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUgKyBcIkFaXCIgKyBjb3VudGVyICsgXCJBZ2dyZWdhdGVab25hbElzb2xhdGVkSW1wYWN0QWxhcm1cIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlQWxhcm1OYW1lOiBhdmFpbGFiaWxpdHlab25lSWQgKyBcIi1cIiArIHByb3BzLm9wZXJhdGlvbi5vcGVyYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgKyBcIi1hZ2dyZWdhdGUtaXNvbGF0ZWQtYXotaW1wYWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGFybVJ1bGU6IEFsYXJtUnVsZS5hbnlPZih0aGlzLmNhbmFyeVpvbmFsQWxhcm1zQW5kUnVsZXNbaV0uaXNvbGF0ZWRJbXBhY3RBbGFybSwgdGhpcy5zZXJ2ZXJTaWRlWm9uYWxBbGFybXNBbmRSdWxlc1tpXS5pc29sYXRlZEltcGFjdEFsYXJtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsYXJtRGVzY3JpcHRpb246IFwie1xcXCJsb2FkQmFsYW5jZXJcXFwiOlxcXCJcIiArIGxvYWRCYWxhbmNlckFybiArIFwiXFxcIixcXFwiYXotaWRcXFwiOlxcXCJcIiArIGF2YWlsYWJpbGl0eVpvbmVJZCArIFwiXFxcIn1cIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVab25hbEFsYXJtcy5wdXNoKHRoaXMuc2VydmVyU2lkZVpvbmFsQWxhcm1zQW5kUnVsZXNbaV0uaXNvbGF0ZWRJbXBhY3RBbGFybSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==