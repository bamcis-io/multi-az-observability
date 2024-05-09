import { Construct } from "constructs";
import { InstrumentedServiceMultiAZObservabilityProps } from "./props/InstrumentedServiceMultiAZObservabilityProps";
import { OperationAlarmsAndRules } from "../alarmsandrules/OperationAlarmsAndRules";
import { ServiceAlarmsAndRules } from "../alarmsandrules/ServiceAlarmsAndRules";
import { IOperation } from "./IOperation";
import { CanaryMetrics, Operation, OutlierDetectionAlgorithm } from "../MultiAvailabilityZoneObservability";
import { Dashboard, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { OperationAvailabilityAndLatencyDashboard } from "../dashboards/OperationAvailabilityAndLatencyDashboard";
import { ServiceAvailabilityAndLatencyDashboard } from "../dashboards/ServiceAvailabilityAndLatencyDashboard";
import { CanaryFunction } from "../canaries/CanaryFunction";
import { CanaryTest } from "../canaries/CanaryTest";
import { Duration, NestedStack } from "aws-cdk-lib";

export class InstrumentedServiceMultiAZObservability extends Construct
{
     /**
     * Key represents the operation name and the value is the set
     * of zonal alarms and rules for that operation. The values themselves
     * are dictionaries that have a key for each AZ ID.
     */
    readonly perOperationAlarmsAndRules: {[key: string]: OperationAlarmsAndRules};

    readonly serviceAlarms: ServiceAlarmsAndRules;

    readonly operationDashboards: Dashboard[];

    readonly serviceDashboard?: Dashboard;

    constructor(scope: Construct, id: string, props: InstrumentedServiceMultiAZObservabilityProps)
    {
        super(scope, id);
        this.operationDashboards = [];
        
        if (props.addSyntheticCanaries !== undefined && props.addSyntheticCanaries == true)
        {
            let canaryNestedStack: NestedStack = new NestedStack(this, "CanaryStack");

            let canary = new CanaryFunction(canaryNestedStack, "CanaryFunction", {
            });

            props.service.operations.forEach((operation, index) => {
                let nestedStack: NestedStack = new NestedStack(this, operation.operationName + "CanaryTestStack");

                // TODO: headers and post data need to be configurable,
                // probably through the IOperation interface,
                let test = new CanaryTest(nestedStack, operation.operationName + "CanaryTest", {
                    function: canary.function,
                    requestCount: 10,
                    schedule: "rate(1 minute)",
                    operation: operation,
                    loadBalancer: props.loadBalancer,
                    availabilityZoneNames: props.service.availabilityZoneNames,
                    headers: {},
                    postData: ""
                });

                let newOperation = new Operation({
                    serverSideAvailabilityMetricDetails: operation.serverSideAvailabilityMetricDetails,
                    serverSideLatencyMetricDetails: operation.serverSideLatencyMetricDetails,
                    serverSideContributorInsightRuleDetails: operation.serverSideContributorInsightRuleDetails,
                    service: operation.service,
                    operationName: operation.operationName,
                    path: operation.path,
                    isCritical: operation.isCritical,
                    httpMethods: operation.httpMethods,
                    canaryMetricDetails: new CanaryMetrics({
                        canaryAvailabilityMetricDetails: {
                            operationName: operation.operationName,
                            metricNamespace: test.metricNamespace,
                            successMetricNames: [ "Success" ],
                            faultMetricNames: [ "Fault", "Error" ],
                            alarmStatistic: operation.serverSideAvailabilityMetricDetails.alarmStatistic,
                            unit: Unit.COUNT,
                            period: operation.serverSideAvailabilityMetricDetails.period,
                            evaluationPeriods: operation.serverSideAvailabilityMetricDetails.evaluationPeriods,
                            datapointsToAlarm: operation.serverSideAvailabilityMetricDetails.datapointsToAlarm,
                            successAlarmThreshold: operation.serverSideAvailabilityMetricDetails.successAlarmThreshold,
                            faultAlarmThreshold: operation.serverSideAvailabilityMetricDetails.faultAlarmThreshold,
                            graphedFaultStatistics: [ "Sum" ],
                            graphedSuccessStatistics: [ "Sum" ],
                            regionalDimensions(region: string) {
                                return {
                                    "Region": region,
                                    "Operation": this.operationName
                                }
                            },
                            zonalDimensions(availabilityZoneId: string, region: string) {
                                return {
                                    "Region": region,
                                    "Operation": this.operationName,
                                    "AZ-ID": availabilityZoneId
                                }
                            }
                        },
                        canaryLatencyMetricDetails: {
                            operationName: operation.operationName,
                            metricNamespace: test.metricNamespace,
                            successMetricNames: [ "SuccessLatency" ],
                            faultMetricNames: [ "FaultLatency" ],
                            alarmStatistic: operation.serverSideLatencyMetricDetails.alarmStatistic,
                            unit: Unit.MILLISECONDS,
                            period: operation.serverSideLatencyMetricDetails.period,
                            evaluationPeriods: operation.serverSideLatencyMetricDetails.evaluationPeriods,
                            datapointsToAlarm: operation.serverSideLatencyMetricDetails.datapointsToAlarm,
                            successAlarmThreshold: operation.serverSideLatencyMetricDetails.successAlarmThreshold,
                            faultAlarmThreshold: operation.serverSideLatencyMetricDetails.faultAlarmThreshold,
                            graphedFaultStatistics: operation.serverSideLatencyMetricDetails.graphedFaultStatistics,
                            graphedSuccessStatistics: operation.serverSideLatencyMetricDetails.graphedSuccessStatistics,
                            regionalDimensions(region: string) {
                                return {
                                    "Region": region,
                                    "Operation": this.operationName
                                }
                            },
                            zonalDimensions(availabilityZoneId: string, region: string) {
                                return {
                                    "Region": region,
                                    "Operation": this.operationName,
                                    "AZ-ID": availabilityZoneId
                                }
                            }
                        },
                        canaryContributorInsightRuleDetails: {
                            logGroups: [ canary.logGroup ],
                            successLatencyMetricJsonPath: "$.SuccessLatency",
                            faultMetricJsonPath: "$.Faults",
                            operationNameJsonPath: "$.Operation",
                            instanceIdJsonPath: "$.InstanceId",
                            availabilityZoneIdJsonPath: "$.AZ-ID"
                        }
                    })
                })

                props.service.operations[index] = newOperation;
            });
        }

        this.perOperationAlarmsAndRules = Object.fromEntries(props.service.operations.map((operation: IOperation) => 
            [
                operation.operationName,              
                new OperationAlarmsAndRules(new NestedStack(this, operation.operationName + "DashboardStack"), operation.operationName + "OperationAlarmsAndRulesNestedStack", {
                    operation: operation,
                    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
                    outlierThreshold: props.outlierThreshold,
                    loadBalancer: props.loadBalancer
                })
            ]
        ));

        let serviceAlarmsStack: NestedStack = new NestedStack(this, "ServiceAlarmsStack");

        this.serviceAlarms = new ServiceAlarmsAndRules(serviceAlarmsStack, "ServiceAlarmsNestedStack", {
            perOperationAlarmsAndRules: this.perOperationAlarmsAndRules,
            service: props.service  
        }); 

        if (props.createDashboards)
        {
            props.service.operations.forEach(x => {
                let dashboardStack: NestedStack = new NestedStack(this, x.operationName + "Dashboard");

                this.operationDashboards.push(
                    new OperationAvailabilityAndLatencyDashboard(dashboardStack, x.operationName + "Dashboard", {
                        operation: x,
                        interval: props.interval ? props.interval : Duration.minutes(60),
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

                    }).dashboard
                );
            })
            
            let dashboardStack: NestedStack = new NestedStack(this, "ServiceDashboardStack");
            this.serviceDashboard = new ServiceAvailabilityAndLatencyDashboard(dashboardStack, props.service.serviceName +  "Dashboard", {
                interval: props.interval ? props.interval : Duration.minutes(60),
                service: props.service,
                aggregateRegionalAlarm: this.serviceAlarms.regionalFaultCountServerSideAlarm,
                zonalAggregateAlarms: this.serviceAlarms.zonalAggregateIsolatedImpactAlarms
            }).dashboard;
        }
    }
}