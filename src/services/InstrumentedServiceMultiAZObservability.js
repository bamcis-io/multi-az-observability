"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentedServiceMultiAZObservability = void 0;
const constructs_1 = require("constructs");
const OperationAlarmsAndRules_1 = require("../alarmsandrules/OperationAlarmsAndRules");
const ServiceAlarmsAndRules_1 = require("../alarmsandrules/ServiceAlarmsAndRules");
const MultiAvailabilityZoneObservability_1 = require("../MultiAvailabilityZoneObservability");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const OperationAvailabilityAndLatencyDashboard_1 = require("../dashboards/OperationAvailabilityAndLatencyDashboard");
const ServiceAvailabilityAndLatencyDashboard_1 = require("../dashboards/ServiceAvailabilityAndLatencyDashboard");
const CanaryFunction_1 = require("../canaries/CanaryFunction");
const CanaryTest_1 = require("../canaries/CanaryTest");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class InstrumentedServiceMultiAZObservability extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.operationDashboards = [];
        if (props.service.operations.filter(x => x.canaryTestProps !== undefined).length > 0) {
            let canary = new CanaryFunction_1.CanaryFunction(new aws_cdk_lib_1.NestedStack(this, "CanaryStack"), "CanaryFunction", {});
            props.service.operations.forEach((operation, index) => {
                if (operation.canaryTestProps !== undefined) {
                    let nestedStack = new aws_cdk_lib_1.NestedStack(this, operation.operationName + "CanaryTestStack");
                    let test = new CanaryTest_1.CanaryTest(nestedStack, operation.operationName + "CanaryTest", {
                        function: canary.function,
                        requestCount: operation.canaryTestProps.requestCount,
                        schedule: operation.canaryTestProps.schedule,
                        operation: operation,
                        loadBalancer: operation.canaryTestProps?.loadBalancer,
                        headers: operation.canaryTestProps.headers,
                        postData: operation.canaryTestProps.postData
                    });
                    let newOperation = new MultiAvailabilityZoneObservability_1.Operation({
                        serverSideAvailabilityMetricDetails: operation.serverSideAvailabilityMetricDetails,
                        serverSideLatencyMetricDetails: operation.serverSideLatencyMetricDetails,
                        serverSideContributorInsightRuleDetails: operation.serverSideContributorInsightRuleDetails,
                        service: operation.service,
                        operationName: operation.operationName,
                        path: operation.path,
                        isCritical: operation.isCritical,
                        httpMethods: operation.httpMethods,
                        canaryMetricDetails: new MultiAvailabilityZoneObservability_1.CanaryMetrics({
                            canaryAvailabilityMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
                                operationName: operation.operationName,
                                metricNamespace: test.metricNamespace,
                                successMetricNames: ["Success"],
                                faultMetricNames: ["Fault", "Error"],
                                alarmStatistic: operation.serverSideAvailabilityMetricDetails.alarmStatistic,
                                unit: aws_cloudwatch_1.Unit.COUNT,
                                period: operation.serverSideAvailabilityMetricDetails.period,
                                evaluationPeriods: operation.serverSideAvailabilityMetricDetails.evaluationPeriods,
                                datapointsToAlarm: operation.serverSideAvailabilityMetricDetails.datapointsToAlarm,
                                successAlarmThreshold: operation.serverSideAvailabilityMetricDetails.successAlarmThreshold,
                                faultAlarmThreshold: operation.serverSideAvailabilityMetricDetails.faultAlarmThreshold,
                                graphedFaultStatistics: ["Sum"],
                                graphedSuccessStatistics: ["Sum"],
                                metricDimensions: {
                                    zonalDimensions(availabilityZoneId, region) {
                                        return {
                                            "AZ-ID": availabilityZoneId,
                                            "Region": region,
                                            "Operation": operation.operationName
                                        };
                                    },
                                    regionalDimensions(region) {
                                        return {
                                            "Region": region,
                                            "Operation": operation.operationName
                                        };
                                    }
                                }
                            }),
                            canaryLatencyMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
                                operationName: operation.operationName,
                                metricNamespace: test.metricNamespace,
                                successMetricNames: ["SuccessLatency"],
                                faultMetricNames: ["FaultLatency"],
                                alarmStatistic: operation.serverSideLatencyMetricDetails.alarmStatistic,
                                unit: aws_cloudwatch_1.Unit.MILLISECONDS,
                                period: operation.serverSideLatencyMetricDetails.period,
                                evaluationPeriods: operation.serverSideLatencyMetricDetails.evaluationPeriods,
                                datapointsToAlarm: operation.serverSideLatencyMetricDetails.datapointsToAlarm,
                                successAlarmThreshold: operation.serverSideLatencyMetricDetails.successAlarmThreshold,
                                faultAlarmThreshold: operation.serverSideLatencyMetricDetails.faultAlarmThreshold,
                                graphedFaultStatistics: operation.serverSideLatencyMetricDetails.graphedFaultStatistics,
                                graphedSuccessStatistics: operation.serverSideLatencyMetricDetails.graphedSuccessStatistics,
                                metricDimensions: {
                                    zonalDimensions(availabilityZoneId, region) {
                                        return {
                                            "AZ-ID": availabilityZoneId,
                                            "Region": region,
                                            "Operation": operation.operationName
                                        };
                                    },
                                    regionalDimensions(region) {
                                        return {
                                            "Region": region,
                                            "Operation": operation.operationName
                                        };
                                    }
                                }
                            }),
                            canaryContributorInsightRuleDetails: {
                                logGroups: [canary.logGroup],
                                successLatencyMetricJsonPath: "$.SuccessLatency",
                                faultMetricJsonPath: "$.Faults",
                                operationNameJsonPath: "$.Operation",
                                instanceIdJsonPath: "$.InstanceId",
                                availabilityZoneIdJsonPath: "$.AZ-ID"
                            }
                        })
                    });
                    props.service.operations[index] = newOperation;
                }
            });
        }
        this.perOperationAlarmsAndRules = Object.fromEntries(props.service.operations.map((operation) => [
            operation.operationName,
            new OperationAlarmsAndRules_1.OperationAlarmsAndRules(new aws_cdk_lib_1.NestedStack(this, operation.operationName + "DashboardStack"), operation.operationName + "OperationAlarmsAndRulesNestedStack", {
                operation: operation,
                outlierDetectionAlgorithm: MultiAvailabilityZoneObservability_1.OutlierDetectionAlgorithm.STATIC,
                outlierThreshold: props.outlierThreshold,
                loadBalancer: props.loadBalancer
            })
        ]));
        let serviceAlarmsStack = new aws_cdk_lib_1.NestedStack(this, "ServiceAlarmsStack");
        this.serviceAlarms = new ServiceAlarmsAndRules_1.ServiceAlarmsAndRules(serviceAlarmsStack, "ServiceAlarmsNestedStack", {
            perOperationAlarmsAndRules: this.perOperationAlarmsAndRules,
            service: props.service
        });
        if (props.createDashboards) {
            props.service.operations.forEach(x => {
                let dashboardStack = new aws_cdk_lib_1.NestedStack(this, x.operationName + "Dashboard");
                this.operationDashboards.push(new OperationAvailabilityAndLatencyDashboard_1.OperationAvailabilityAndLatencyDashboard(dashboardStack, x.operationName + "Dashboard", {
                    operation: x,
                    interval: props.interval ? props.interval : aws_cdk_lib_1.Duration.minutes(60),
                    loadBalancer: props.loadBalancer,
                    regionalEndpointCanaryAvailabilityAlarm: this.perOperationAlarmsAndRules[x.operationName].canaryRegionalAlarmsAndRules?.availabilityAlarm,
                    regionalEndpointCanaryLatencyAlarm: this.perOperationAlarmsAndRules[x.operationName].canaryRegionalAlarmsAndRules?.latencyAlarm,
                    regionalEndpointServerAvailabilityAlarm: this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.availabilityAlarm,
                    regionalEndpointServerLatencyAlarm: this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.latencyAlarm,
                    zonalEndpointCanaryAvailabilityAlarms: this.perOperationAlarmsAndRules[x.operationName].canaryZonalAlarmsAndRules.map(x => x.availabilityAlarm),
                    zonalEndpointCanaryLatencyAlarms: this.perOperationAlarmsAndRules[x.operationName].canaryZonalAlarmsAndRules.map(x => x.latencyAlarm),
                    zonalEndpointServerAvailabilityAlarms: this.perOperationAlarmsAndRules[x.operationName].serverSideZonalAlarmsAndRules.map(x => x.availabilityAlarm),
                    zonalEndpointServerLatencyAlarms: this.perOperationAlarmsAndRules[x.operationName].serverSideZonalAlarmsAndRules.map(x => x.latencyAlarm),
                    isolatedAZImpactAlarms: this.perOperationAlarmsAndRules[x.operationName].aggregateZonalAlarms,
                    regionalImpactAlarm: this.perOperationAlarmsAndRules[x.operationName].aggregateRegionalAlarm,
                    instanceContributorsToFaults: this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalFaults,
                    instanceContributorsToHighLatency: this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalHighLatency,
                }).dashboard);
            });
            let dashboardStack = new aws_cdk_lib_1.NestedStack(this, "ServiceDashboardStack");
            this.serviceDashboard = new ServiceAvailabilityAndLatencyDashboard_1.ServiceAvailabilityAndLatencyDashboard(dashboardStack, props.service.serviceName + "Dashboard", {
                interval: props.interval ? props.interval : aws_cdk_lib_1.Duration.minutes(60),
                service: props.service,
                aggregateRegionalAlarm: this.serviceAlarms.regionalFaultCountServerSideAlarm,
                zonalAggregateAlarms: this.serviceAlarms.zonalAggregateIsolatedImpactAlarms
            }).dashboard;
        }
    }
}
exports.InstrumentedServiceMultiAZObservability = InstrumentedServiceMultiAZObservability;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zdHJ1bWVudGVkU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSW5zdHJ1bWVudGVkU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF1QztBQUV2Qyx1RkFBb0Y7QUFDcEYsbUZBQWdGO0FBRWhGLDhGQUFvSTtBQUNwSSwrREFBNkQ7QUFDN0QscUhBQWtIO0FBQ2xILGlIQUE4RztBQUM5RywrREFBNEQ7QUFDNUQsdURBQW9EO0FBQ3BELDZDQUFvRDtBQUVwRCxNQUFhLHVDQUF3QyxTQUFRLHNCQUFTO0lBZWxFLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBbUQ7UUFFekYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBRTlCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNwRixDQUFDO1lBQ0csSUFBSSxNQUFNLEdBQUcsSUFBSSwrQkFBYyxDQUFDLElBQUkseUJBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsRUFDdkYsQ0FBQyxDQUFDO1lBRUgsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUVsRCxJQUFJLFNBQVMsQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUMzQyxDQUFDO29CQUNHLElBQUksV0FBVyxHQUFnQixJQUFJLHlCQUFXLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztvQkFFbEcsSUFBSSxJQUFJ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QzlFLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQTNMRCwwRkEyTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgSW5zdHJ1bWVudGVkU2VydmljZU11bHRpQVpPYnNlcnZhYmlsaXR5UHJvcHMgfSBmcm9tIFwiLi9wcm9wcy9JbnN0cnVtZW50ZWRTZXJ2aWNlTXVsdGlBWk9ic2VydmFiaWxpdHlQcm9wc1wiO1xuaW1wb3J0IHsgT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXMgfSBmcm9tIFwiLi4vYWxhcm1zYW5kcnVsZXMvT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IFNlcnZpY2VBbGFybXNBbmRSdWxlcyB9IGZyb20gXCIuLi9hbGFybXNhbmRydWxlcy9TZXJ2aWNlQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IElPcGVyYXRpb24gfSBmcm9tIFwiLi9JT3BlcmF0aW9uXCI7XG5pbXBvcnQgeyBDYW5hcnlNZXRyaWNzLCBPcGVyYXRpb24sIE9wZXJhdGlvbk1ldHJpY0RldGFpbHMsIE91dGxpZXJEZXRlY3Rpb25BbGdvcml0aG0gfSBmcm9tIFwiLi4vTXVsdGlBdmFpbGFiaWxpdHlab25lT2JzZXJ2YWJpbGl0eVwiO1xuaW1wb3J0IHsgRGFzaGJvYXJkLCBVbml0IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoXCI7XG5pbXBvcnQgeyBPcGVyYXRpb25BdmFpbGFiaWxpdHlBbmRMYXRlbmN5RGFzaGJvYXJkIH0gZnJvbSBcIi4uL2Rhc2hib2FyZHMvT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFwiO1xuaW1wb3J0IHsgU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQgfSBmcm9tIFwiLi4vZGFzaGJvYXJkcy9TZXJ2aWNlQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZFwiO1xuaW1wb3J0IHsgQ2FuYXJ5RnVuY3Rpb24gfSBmcm9tIFwiLi4vY2FuYXJpZXMvQ2FuYXJ5RnVuY3Rpb25cIjtcbmltcG9ydCB7IENhbmFyeVRlc3QgfSBmcm9tIFwiLi4vY2FuYXJpZXMvQ2FuYXJ5VGVzdFwiO1xuaW1wb3J0IHsgRHVyYXRpb24sIE5lc3RlZFN0YWNrIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50ZWRTZXJ2aWNlTXVsdGlBWk9ic2VydmFiaWxpdHkgZXh0ZW5kcyBDb25zdHJ1Y3RcbntcbiAgICAgLyoqXG4gICAgICogS2V5IHJlcHJlc2VudHMgdGhlIG9wZXJhdGlvbiBuYW1lIGFuZCB0aGUgdmFsdWUgaXMgdGhlIHNldFxuICAgICAqIG9mIHpvbmFsIGFsYXJtcyBhbmQgcnVsZXMgZm9yIHRoYXQgb3BlcmF0aW9uLiBUaGUgdmFsdWVzIHRoZW1zZWx2ZXNcbiAgICAgKiBhcmUgZGljdGlvbmFyaWVzIHRoYXQgaGF2ZSBhIGtleSBmb3IgZWFjaCBBWiBJRC5cbiAgICAgKi9cbiAgICByZWFkb25seSBwZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlczoge1trZXk6IHN0cmluZ106IE9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzfTtcblxuICAgIHJlYWRvbmx5IHNlcnZpY2VBbGFybXM6IFNlcnZpY2VBbGFybXNBbmRSdWxlcztcblxuICAgIHJlYWRvbmx5IG9wZXJhdGlvbkRhc2hib2FyZHM6IERhc2hib2FyZFtdO1xuXG4gICAgcmVhZG9ubHkgc2VydmljZURhc2hib2FyZD86IERhc2hib2FyZDtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBJbnN0cnVtZW50ZWRTZXJ2aWNlTXVsdGlBWk9ic2VydmFiaWxpdHlQcm9wcylcbiAgICB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgICAgIHRoaXMub3BlcmF0aW9uRGFzaGJvYXJkcyA9IFtdO1xuXG4gICAgICAgIGlmIChwcm9wcy5zZXJ2aWNlLm9wZXJhdGlvbnMuZmlsdGVyKHggPT4geC5jYW5hcnlUZXN0UHJvcHMgIT09IHVuZGVmaW5lZCkubGVuZ3RoID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGNhbmFyeSA9IG5ldyBDYW5hcnlGdW5jdGlvbihuZXcgTmVzdGVkU3RhY2sodGhpcywgXCJDYW5hcnlTdGFja1wiKSwgXCJDYW5hcnlGdW5jdGlvblwiLCB7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcHJvcHMuc2VydmljZS5vcGVyYXRpb25zLmZvckVhY2goKG9wZXJhdGlvbiwgaW5kZXgpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24uY2FuYXJ5VGVzdFByb3BzICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmVzdGVkU3RhY2s6IE5lc3RlZFN0YWNrID0gbmV3IE5lc3RlZFN0YWNrKHRoaXMsIG9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJDYW5hcnlUZXN0U3RhY2tcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlc3QgPSBuZXcgQ2FuYXJ5VGVzdChuZXN0ZWRTdGFjaywgb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUgKyBcIkNhbmFyeVRlc3RcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb246IGNhbmFyeS5mdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RDb3VudDogb3BlcmF0aW9uLmNhbmFyeVRlc3RQcm9wcy5yZXF1ZXN0Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZTogb3BlcmF0aW9uLmNhbmFyeVRlc3RQcm9wcy5zY2hlZHVsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogb3BlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VyOiBvcGVyYXRpb24uY2FuYXJ5VGVzdFByb3BzPy5sb2FkQmFsYW5jZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBvcGVyYXRpb24uY2FuYXJ5VGVzdFByb3BzLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0RGF0YTogb3BlcmF0aW9uLmNhbmFyeVRlc3RQcm9wcy5wb3N0RGF0YVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3T3BlcmF0aW9uID0gbmV3IE9wZXJhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlsczogb3BlcmF0aW9uLnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU2lkZUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzOiBvcGVyYXRpb24uc2VydmVyU2lkZUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZTogb3BlcmF0aW9uLnNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBvcGVyYXRpb24ub3BlcmF0aW9uTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IG9wZXJhdGlvbi5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDcml0aWNhbDogb3BlcmF0aW9uLmlzQ3JpdGljYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBodHRwTWV0aG9kczogb3BlcmF0aW9uLmh0dHBNZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuYXJ5TWV0cmljRGV0YWlsczogbmV3IENhbmFyeU1ldHJpY3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmFyeUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWVzcGFjZTogdGVzdC5tZXRyaWNOYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NcIiBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRcIiwgXCJFcnJvclwiIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBvcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMuYWxhcm1TdGF0aXN0aWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogb3BlcmF0aW9uLnNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzLnBlcmlvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IG9wZXJhdGlvbi5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscy5ldmFsdWF0aW9uUGVyaW9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IG9wZXJhdGlvbi5zZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlscy5kYXRhcG9pbnRzVG9BbGFybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0FsYXJtVGhyZXNob2xkOiBvcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiBvcGVyYXRpb24uc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMuZmF1bHRBbGFybVRocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGhlZEZhdWx0U3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY0RpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbmFsRGltZW5zaW9ucyhhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkFaLUlEXCI6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBvcGVyYXRpb24ub3BlcmF0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IG9wZXJhdGlvbi5vcGVyYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuYXJ5TGF0ZW5jeU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWVzcGFjZTogdGVzdC5tZXRyaWNOYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0TGF0ZW5jeVwiIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLmFsYXJtU3RhdGlzdGljLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0OiBVbml0Lk1JTExJU0VDT05EUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLnBlcmlvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IG9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMuZXZhbHVhdGlvblBlcmlvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLmRhdGFwb2ludHNUb0FsYXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IG9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMuc3VjY2Vzc0FsYXJtVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLmZhdWx0QWxhcm1UaHJlc2hvbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IG9wZXJhdGlvbi5zZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHMuZ3JhcGhlZEZhdWx0U3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBvcGVyYXRpb24uc2VydmVyU2lkZUxhdGVuY3lNZXRyaWNEZXRhaWxzLmdyYXBoZWRTdWNjZXNzU3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljRGltZW5zaW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQVotSURcIjogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IG9wZXJhdGlvbi5vcGVyYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5hcnlDb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dHcm91cHM6IFsgY2FuYXJ5LmxvZ0dyb3VwIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NMYXRlbmN5TWV0cmljSnNvblBhdGg6IFwiJC5TdWNjZXNzTGF0ZW5jeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVsdE1ldHJpY0pzb25QYXRoOiBcIiQuRmF1bHRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbk5hbWVKc29uUGF0aDogXCIkLk9wZXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkSnNvblBhdGg6IFwiJC5JbnN0YW5jZUlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZEpzb25QYXRoOiBcIiQuQVotSURcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnNlcnZpY2Uub3BlcmF0aW9uc1tpbmRleF0gPSBuZXdPcGVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzID0gT2JqZWN0LmZyb21FbnRyaWVzKHByb3BzLnNlcnZpY2Uub3BlcmF0aW9ucy5tYXAoKG9wZXJhdGlvbjogSU9wZXJhdGlvbikgPT4gXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUsICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXcgT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXMobmV3IE5lc3RlZFN0YWNrKHRoaXMsIG9wZXJhdGlvbi5vcGVyYXRpb25OYW1lICsgXCJEYXNoYm9hcmRTdGFja1wiKSwgb3BlcmF0aW9uLm9wZXJhdGlvbk5hbWUgKyBcIk9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzTmVzdGVkU3RhY2tcIiwge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246IG9wZXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgb3V0bGllckRldGVjdGlvbkFsZ29yaXRobTogT3V0bGllckRldGVjdGlvbkFsZ29yaXRobS5TVEFUSUMsXG4gICAgICAgICAgICAgICAgICAgIG91dGxpZXJUaHJlc2hvbGQ6IHByb3BzLm91dGxpZXJUaHJlc2hvbGQsXG4gICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlcjogcHJvcHMubG9hZEJhbGFuY2VyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgKSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IHNlcnZpY2VBbGFybXNTdGFjazogTmVzdGVkU3RhY2sgPSBuZXcgTmVzdGVkU3RhY2sodGhpcywgXCJTZXJ2aWNlQWxhcm1zU3RhY2tcIik7XG5cbiAgICAgICAgdGhpcy5zZXJ2aWNlQWxhcm1zID0gbmV3IFNlcnZpY2VBbGFybXNBbmRSdWxlcyhzZXJ2aWNlQWxhcm1zU3RhY2ssIFwiU2VydmljZUFsYXJtc05lc3RlZFN0YWNrXCIsIHtcbiAgICAgICAgICAgIHBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzOiB0aGlzLnBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzLFxuICAgICAgICAgICAgc2VydmljZTogcHJvcHMuc2VydmljZSAgXG4gICAgICAgIH0pOyBcblxuICAgICAgICBpZiAocHJvcHMuY3JlYXRlRGFzaGJvYXJkcylcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvcHMuc2VydmljZS5vcGVyYXRpb25zLmZvckVhY2goeCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRhc2hib2FyZFN0YWNrOiBOZXN0ZWRTdGFjayA9IG5ldyBOZXN0ZWRTdGFjayh0aGlzLCB4Lm9wZXJhdGlvbk5hbWUgKyBcIkRhc2hib2FyZFwiKTtcblxuICAgICAgICAgICAgICAgIHRoaXMub3BlcmF0aW9uRGFzaGJvYXJkcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBuZXcgT3BlcmF0aW9uQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeURhc2hib2FyZChkYXNoYm9hcmRTdGFjaywgeC5vcGVyYXRpb25OYW1lICsgXCJEYXNoYm9hcmRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uOiB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHByb3BzLmludGVydmFsID8gcHJvcHMuaW50ZXJ2YWwgOiBEdXJhdGlvbi5taW51dGVzKDYwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlcjogcHJvcHMubG9hZEJhbGFuY2VyLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb25hbEVuZHBvaW50Q2FuYXJ5QXZhaWxhYmlsaXR5QWxhcm06IHRoaXMucGVyT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNbeC5vcGVyYXRpb25OYW1lXS5jYW5hcnlSZWdpb25hbEFsYXJtc0FuZFJ1bGVzPy5hdmFpbGFiaWxpdHlBbGFybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRDYW5hcnlMYXRlbmN5QWxhcm06IHRoaXMucGVyT3BlcmF0aW9uQWxhcm1zQW5kUnVsZXNbeC5vcGVyYXRpb25OYW1lXS5jYW5hcnlSZWdpb25hbEFsYXJtc0FuZFJ1bGVzPy5sYXRlbmN5QWxhcm0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbmFsRW5kcG9pbnRTZXJ2ZXJBdmFpbGFiaWxpdHlBbGFybTogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLnNlcnZlclNpZGVSZWdpb25hbEFsYXJtc0FuZFJ1bGVzLmF2YWlsYWJpbGl0eUFsYXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uYWxFbmRwb2ludFNlcnZlckxhdGVuY3lBbGFybTogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLnNlcnZlclNpZGVSZWdpb25hbEFsYXJtc0FuZFJ1bGVzLmxhdGVuY3lBbGFybSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgem9uYWxFbmRwb2ludENhbmFyeUF2YWlsYWJpbGl0eUFsYXJtczogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLmNhbmFyeVpvbmFsQWxhcm1zQW5kUnVsZXMubWFwKHggPT4geC5hdmFpbGFiaWxpdHlBbGFybSksXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25hbEVuZHBvaW50Q2FuYXJ5TGF0ZW5jeUFsYXJtczogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLmNhbmFyeVpvbmFsQWxhcm1zQW5kUnVsZXMubWFwKHggPT4geC5sYXRlbmN5QWxhcm0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25hbEVuZHBvaW50U2VydmVyQXZhaWxhYmlsaXR5QWxhcm1zOiB0aGlzLnBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzW3gub3BlcmF0aW9uTmFtZV0uc2VydmVyU2lkZVpvbmFsQWxhcm1zQW5kUnVsZXMubWFwKHggPT4geC5hdmFpbGFiaWxpdHlBbGFybSksXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25hbEVuZHBvaW50U2VydmVyTGF0ZW5jeUFsYXJtczogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLnNlcnZlclNpZGVab25hbEFsYXJtc0FuZFJ1bGVzLm1hcCh4ID0+IHgubGF0ZW5jeUFsYXJtKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgaXNvbGF0ZWRBWkltcGFjdEFsYXJtczogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLmFnZ3JlZ2F0ZVpvbmFsQWxhcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uYWxJbXBhY3RBbGFybTogdGhpcy5wZXJPcGVyYXRpb25BbGFybXNBbmRSdWxlc1t4Lm9wZXJhdGlvbk5hbWVdLmFnZ3JlZ2F0ZVJlZ2lvbmFsQWxhcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUNvbnRyaWJ1dG9yc1RvRmF1bHRzOiB0aGlzLnBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzW3gub3BlcmF0aW9uTmFtZV0uc2VydmVyU2lkZVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMuaW5zdGFuY2VDb250cmlidXRvcnNUb1JlZ2lvbmFsRmF1bHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VDb250cmlidXRvcnNUb0hpZ2hMYXRlbmN5OiB0aGlzLnBlck9wZXJhdGlvbkFsYXJtc0FuZFJ1bGVzW3gub3BlcmF0aW9uTmFtZV0uc2VydmVyU2lkZVJlZ2lvbmFsQWxhcm1zQW5kUnVsZXMuaW5zdGFuY2VDb250cmlidXRvcnNUb1JlZ2lvbmFsSGlnaExhdGVuY3ksXG5cbiAgICAgICAgICAgICAgICAgICAgfSkuZGFzaGJvYXJkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBkYXNoYm9hcmRTdGFjazogTmVzdGVkU3RhY2sgPSBuZXcgTmVzdGVkU3RhY2sodGhpcywgXCJTZXJ2aWNlRGFzaGJvYXJkU3RhY2tcIik7XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2VEYXNoYm9hcmQgPSBuZXcgU2VydmljZUF2YWlsYWJpbGl0eUFuZExhdGVuY3lEYXNoYm9hcmQoZGFzaGJvYXJkU3RhY2ssIHByb3BzLnNlcnZpY2Uuc2VydmljZU5hbWUgKyAgXCJEYXNoYm9hcmRcIiwge1xuICAgICAgICAgICAgICAgIGludGVydmFsOiBwcm9wcy5pbnRlcnZhbCA/IHByb3BzLmludGVydmFsIDogRHVyYXRpb24ubWludXRlcyg2MCksXG4gICAgICAgICAgICAgICAgc2VydmljZTogcHJvcHMuc2VydmljZSxcbiAgICAgICAgICAgICAgICBhZ2dyZWdhdGVSZWdpb25hbEFsYXJtOiB0aGlzLnNlcnZpY2VBbGFybXMucmVnaW9uYWxGYXVsdENvdW50U2VydmVyU2lkZUFsYXJtLFxuICAgICAgICAgICAgICAgIHpvbmFsQWdncmVnYXRlQWxhcm1zOiB0aGlzLnNlcnZpY2VBbGFybXMuem9uYWxBZ2dyZWdhdGVJc29sYXRlZEltcGFjdEFsYXJtc1xuICAgICAgICAgICAgfSkuZGFzaGJvYXJkO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==