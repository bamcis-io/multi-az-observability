import { Construct } from "constructs";
import { IInstrumentedServiceProps } from "./props/IInstrumentedServiceProps";
import { OperationAlarmsAndRules } from "../alarmsandrules/OperationAlarmsAndRules";
import { ServiceAlarmsAndRules } from "../alarmsandrules/ServiceAlarmsAndRules";
import { IOperation } from "./IOperation";
import { OutlierDetectionAlgorithm } from "../MultiAvailabilityZoneObservability";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
import { OperationAvailabilityAndLatencyDashboard } from "../dashboards/OperationAvailabilityAndLatencyDashboard";
import { ServiceAvailabilityAndLatencyDashboard } from "../dashboards/ServiceAvailabilityAndLatencyDashboard";

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

    constructor(scope: Construct, id: string, props: IInstrumentedServiceProps)
    {
        super(scope, id);
        this.operationDashboards = [];

        this.perOperationAlarmsAndRules = Object.fromEntries(props.service.operations.map((operation: IOperation) => 
            [
                operation.operationName,              
                new OperationAlarmsAndRules(this, operation.operationName + "OperationAlarmsAndRulesNestedStack", {
                    operation: operation,
                    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
                    outlierThreshold: props.outlierThreshold,
                    loadBalancer: props.loadBalancer      
                })
            ]
        ));

        this.serviceAlarms = new ServiceAlarmsAndRules(this, "ServiceAlarmsNestedStack", {
            perOperationAlarmsAndRules: this.perOperationAlarmsAndRules,
            service: props.service            
        }); 

        if (props.createDashboard)
        {
            props.service.operations.forEach(x => {
                this.operationDashboards.push(
                    new OperationAvailabilityAndLatencyDashboard(this, x.operationName + "Dashboard", {
                        availabilityZoneIds: props.service.availabilityZoneIds,
                        operation: x,
                        availabilityZoneMapper: props.availabilityZoneMapper,
                        interval: props.interval,
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
            
            this.serviceDashboard = new ServiceAvailabilityAndLatencyDashboard(this, props.service.serviceName +  "Dashboard", {
                interval: props.interval,
                service: props.service,
                aggregateRegionalAlarm: this.serviceAlarms.regionalFaultCountServerSideAlarm,
                zonalAggregateAlarms: this.serviceAlarms.zonalAggregateIsolatedImpactAlarms
            }).dashboard;
        }
    }
}