import { Construct } from "constructs";
import { IOperation } from "../IOperation";
import { IOperationAlarmsAndRulesProps } from "./props/IOperationAlarmsAndRulesProps";
import { ServerSideOperationRegionalAlarmsAndRules } from "./ServerSideOperationRegionalAlarmsAndRules";
import { CanaryOperationRegionalAlarmsAndRules } from "./CanaryOperationRegionalAlarmsAndRules";
import { IOperationAlarmsAndRules } from "./IOperationAlarmsAndRules";
import { BaseLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AlarmRule, CompositeAlarm, IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { Fn } from "aws-cdk-lib";
import { ServerSideOperationZonalAlarmsAndRules } from "./ServerSideOperationZonalAlarmsAndRules";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";
import { ICanaryOperationRegionalAlarmsAndRules } from "./ICanaryOperationRegionalAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRules } from "./ICanaryOperationZonalAlarmsAndRules";
import { IServerSideOperationZonalAlarmsAndRules } from "./IServerSideOperationZonalAlarmsAndRules";

/**
 * Creates alarms and rules for an operation for both regional and zonal metrics
 */
export class OperationAlarmsAndRules extends Construct implements IOperationAlarmsAndRules
{
    /**
     * The operation the alarms and rules are created for
     */
    operation: IOperation;

    /**
     * The server side regional alarms and rules
     */
    serverSideRegionalAlarmsAndRules: IServerSideOperationRegionalAlarmsAndRules;

    /**
     * The canary regional alarms and rules
     */
    canaryRegionalAlarmsAndRules: ICanaryOperationRegionalAlarmsAndRules;

    /**
     * The aggregate regional alarm that looks at both canary and server
     * side impact alarms for latency and availability
     */
    aggregateRegionalAlarm: IAlarm;

    /**
     * The server side zonal alarms and rules
     */
    serverSideZonalAlarmsAndRules: IServerSideOperationZonalAlarmsAndRules[];

    /**
     * The canary zonal alarms and rules
     */
    canaryZonalAlarmsAndRules: ICanaryOperationZonalAlarmsAndRules[];

    /**
     * The aggregate zonal alarms, one per AZ. Each alarm indicates there is either
     * latency or availability impact in that AZ, and the AZ is an outlier for
     * availability or latency impact. Both server side and canary metrics are
     * evaluated
     */
    aggregateZonalAlarms: IAlarm[];

    constructor(scope: Construct, id: string, props: IOperationAlarmsAndRulesProps)
    {
        super(scope, id);
        this.serverSideZonalAlarmsAndRules = [];
        this.canaryZonalAlarmsAndRules = [];
        this.aggregateZonalAlarms = [];
        this.operation = props.operation;

        let loadBalancerArn = (props.loadBalancer as BaseLoadBalancer).loadBalancerArn;

        this.serverSideRegionalAlarmsAndRules = new ServerSideOperationRegionalAlarmsAndRules(
            this, 
            props.operation.operationName + "ServerSideRegionalAlarms",
            {
                availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
                contributorInsightRuleDetails: props.operation.serverSideContributorInsightRuleDetails,
                nameSuffix: "-server"
            }
        );

        this.canaryRegionalAlarmsAndRules = new CanaryOperationRegionalAlarmsAndRules(
            this,
            props.operation.operationName + "CanaryRegionalAlarms",
            {
                availabilityMetricDetails: props.operation.canaryAvailabilityMetricDetails,
                latencyMetricDetails: props.operation.canaryLatencyMetricDetails,
                contributorInsightRuleDetails: props.operation.canaryContributorInsightRuleDetails,
                nameSuffix: "-canary"
            }
        );

        this.aggregateRegionalAlarm = new CompositeAlarm(this, props.operation.operationName + "AggregateRegionalAlarm", {
            actionsEnabled: false,
            compositeAlarmName: Fn.ref("AWS::Region") + "-" + props.operation.operationName.toLowerCase() + "-" + "aggregate-alarm",
            alarmRule: AlarmRule.anyOf(this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm, this.canaryRegionalAlarmsAndRules.availabilityOrLatencyAlarm)
        });

        let counter: number = 1;

        for (let i = 0; i < props.operation.service.azCount; i++)
        {
            let availabilityZoneId: string = props.operation.service.GetAvailabilityZoneIdAtIndex(i);
            
            this.serverSideZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules(
                this, 
                props.operation.operationName + "AZ" + counter + "ServerSideZonalAlarmsAndRules",
                {
                    availabilityZoneId: availabilityZoneId,
                    availabilityMetricDetails: props.operation.serverSideAvailabilityMetricDetails,
                    latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
                    contributorInsightRuleDetails: props.operation.serverSideContributorInsightRuleDetails,
                    counter: counter,
                    outlierThreshold: props.outlierThreshold,
                    outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
                    nameSuffix: "-server"
                }
            ));
            
            this.canaryZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules(
                this, 
                props.operation.operationName + "AZ" + counter + "CanaryZonalAlarmsAndRules",
                {
                    availabilityZoneId: availabilityZoneId,
                    availabilityMetricDetails: props.operation.canaryAvailabilityMetricDetails,
                    latencyMetricDetails: props.operation.canaryLatencyMetricDetails,
                    contributorInsightRuleDetails: props.operation.canaryContributorInsightRuleDetails,
                    counter: counter,
                    outlierThreshold: props.outlierThreshold,
                    outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
                    nameSuffix: "-canary"
                }
            ));

            this.aggregateZonalAlarms.push(new CompositeAlarm(
                this, 
                props.operation.operationName + "AZ" + counter + "AggregateZonalIsolatedImpactAlarm",
                {
                    compositeAlarmName: availabilityZoneId + "-" + props.operation.operationName.toLowerCase() + "-aggregate-isolated-az-impact",
                    alarmRule: AlarmRule.anyOf(this.canaryZonalAlarmsAndRules[i].isolatedImpactAlarm, this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm),
                    actionsEnabled: false,
                    alarmDescription: "{\"loadBalancer\":\"" + loadBalancerArn + "\",\"az-id\":\"" + availabilityZoneId + "\"}"
                }
            ));

            counter++;
        }
    }
}