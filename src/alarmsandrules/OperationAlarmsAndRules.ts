import { Construct } from "constructs";
import { IOperation } from "../IOperation";
import { IOperationAlarmsAndRulesProps } from "./props/IOperationAlarmsAndRulesProps";
import { ServerSideOperationRegionalAlarmsAndRules } from "./ServerSideOperationRegionalAlarmsAndRules";
import { CanaryOperationRegionalAlarmsAndRules } from "./CanaryOperationRegionalAlarmsAndRules";
import { IOperationAlarmsAndRules } from "./IOperationAlarmsAndRules";
import { BaseLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ServerSideOperationRegionalAlarmsAndRulesProps } from "./props/ServerSideOperationRegionalAlarmsAndRulesProps";
import { IServerSideOperationRegionalAlarmsAndRulesProps } from "./props/IServerSideOperationRegionalAlarmsAndRulesProps";
import { ICanaryOperationRegionalAlarmsAndRulesProps } from "./props/ICanaryOperationRegionalAlarmsAndRulesProps";
import { CanaryOperationRegionalAlarmsAndRulesProps } from "./props/CanaryOperationRegionalAlarmsAndRulesProps";
import { AlarmRule, CompositeAlarm, IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { Fn } from "aws-cdk-lib";
import { ServerSideOperationZonalAlarmsAndRules } from "./ServerSideOperationZonalAlarmsAndRules";
import { CanaryOperationZonalAlarmsAndRules } from "./CanaryOperationZonalAlarmsAndRules";
import { ServerSideOperationZonalAlarmsAndRulesProps } from "./props/ServerSideOperationZonalAlarmsAndRulesProps";
import { IServerSideOperationZonalAlarmsAndRulesProps } from "./props/IServerSideOperationZonalAlarmsAndRulesProps";
import { CanaryOperationZonalAlarmsAndRulesProps } from "./props/CanaryOperationZonalAlarmsAndRulesProps";
import { ICanaryOperationZonalAlarmsAndRulesProps } from "./props/ICanaryOperationZonalAlarmsAndRulesProps";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";
import { ICanaryOperationRegionalAlarmsAndRules } from "./ICanaryOperationRegionalAlarmsAndRules";

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
    serverSideZonalAlarmsAndRules: ServerSideOperationZonalAlarmsAndRules[];

    /**
     * The canary zonal alarms and rules
     */
    canaryZonalAlarmsAndRules: CanaryOperationZonalAlarmsAndRules[];

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
        let loadBalancerArn = (props.loadBalancer as BaseLoadBalancer).loadBalancerArn;

        let serverSideRegionalAlarmsAndRulesProps: IServerSideOperationRegionalAlarmsAndRulesProps = new ServerSideOperationRegionalAlarmsAndRulesProps();
        serverSideRegionalAlarmsAndRulesProps.availabilityMetricDetails = props.operation.serverSideAvailabilityMetricDetails;
        serverSideRegionalAlarmsAndRulesProps.latencyMetricDetails = props.operation.serverSideLatencyMetricDetails;
        serverSideRegionalAlarmsAndRulesProps.contributorInsightRuleDetails = props.operation.serverSideContributorInsightRuleDetails;
                
        this.serverSideRegionalAlarmsAndRules = new ServerSideOperationRegionalAlarmsAndRules(
            this, 
            props.operation.operationName + "ServerSideRegionalAlarms",
            serverSideRegionalAlarmsAndRulesProps
        );

        let canaryRegionalAlarmsAndRulesProps: ICanaryOperationRegionalAlarmsAndRulesProps = new CanaryOperationRegionalAlarmsAndRulesProps();
        canaryRegionalAlarmsAndRulesProps.availabilityMetricDetails = props.operation.canaryAvailabilityMetricDetails;
        canaryRegionalAlarmsAndRulesProps.contributorInsightRuleDetails = props.operation.canaryContributorInsightRuleDetails;
        canaryRegionalAlarmsAndRulesProps.latencyMetricDetails = props.operation.canaryLatencyMetricDetails;

        this.canaryRegionalAlarmsAndRules = new CanaryOperationRegionalAlarmsAndRules(
            this,
            props.operation.operationName + "CanaryRegionalAlarms",
            canaryRegionalAlarmsAndRulesProps
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

            let zonalProps: IServerSideOperationZonalAlarmsAndRulesProps = new ServerSideOperationZonalAlarmsAndRulesProps();
            zonalProps.availabilityZoneId = availabilityZoneId;
            zonalProps.availabilityMetricDetails = props.operation.serverSideAvailabilityMetricDetails;
            zonalProps.latencyMetricDetails = props.operation.serverSideLatencyMetricDetails;
            zonalProps.contributorInsightRuleDetails = props.operation.serverSideContributorInsightRuleDetails;
            zonalProps.counter = counter;
            zonalProps.outlierThreshold = props.outlierThreshold;
            
            this.serverSideZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules(
                this, 
                props.operation.operationName + "AZ" + counter + "ServerSideZonalAlarmsAndRules",
                zonalProps
            ));

            let canaryZonalProps: ICanaryOperationZonalAlarmsAndRulesProps = new CanaryOperationZonalAlarmsAndRulesProps();
            canaryZonalProps.availabilityZoneId = availabilityZoneId;
            canaryZonalProps.availabilityMetricDetails = props.operation.canaryAvailabilityMetricDetails;
            canaryZonalProps.latencyMetricDetails = props.operation.canaryLatencyMetricDetails;
            canaryZonalProps.contributorInsightRuleDetails = props.operation.canaryContributorInsightRuleDetails;
            canaryZonalProps.counter = counter;
            canaryZonalProps.outlierThreshold = props.outlierThreshold;
            
            this.canaryZonalAlarmsAndRules.push(new ServerSideOperationZonalAlarmsAndRules(
                this, 
                props.operation.operationName + "AZ" + counter + "CanaryZonalAlarmsAndRules",
                canaryZonalProps
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