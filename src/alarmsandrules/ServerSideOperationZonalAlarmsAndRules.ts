import { Construct } from "constructs";
import { BaseOperationZonalAlarmsAndRules } from "./BaseOperationZonalAlarmsAndRules";
import { IServerSideOperationZonalAlarmsAndRulesProps } from "./props/IServerSideOperationZonalAlarmsAndRulesProps";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { IServerSideOperationZonalAlarmsAndRules } from "./IServerSideOperationZonalAlarmsAndRules";

/**
 * The server side alarms and rules for an operation in an Availability Zone
 */
export class ServerSideOperationZonalAlarmsAndRules extends BaseOperationZonalAlarmsAndRules implements IServerSideOperationZonalAlarmsAndRules
{
    /**
     * Alarm that triggers if either latency or availability breach the specified
     * threshold in this AZ and the AZ is an outlier for faults or latency
     */
    isolatedImpactAlarm: IAlarm;

    /**
     * Alarm indicating that there are multiple instances producing faults in 
     * this AZ indicating the fault rate is not being caused by a single instance
     */
    multipleInstancesProducingFaultsInThisAvailabilityZone: IAlarm;

    /**
     * Alarm indicating that there are multiple instances producing high
     * latency responses in this AZ indicating the latency is not being 
     * caused by a single instance
     */
    multipleInstancesProducingHighLatencyInThisAZ: IAlarm;

    /**
     * Insight rule that measures the number of instances contributing to high latency in this AZ
     */
    instanceContributorsToHighLatencyInThisAZ: CfnInsightRule;

    /**
     * Insight rule that measures the number of instances contributing to faults in this AZ
     */
    instanceContributorsToFaultsInThisAZ: CfnInsightRule;

    /**
     * Insight rule that is used to calculate the number of instances in this particular AZ that is used with metric math to calculate
     * the percent of instances contributing to latency or faults
     */
    instancesHandlingRequestsInThisAZ: CfnInsightRule;

    constructor(scope: Construct, id: string, props: IServerSideOperationZonalAlarmsAndRulesProps)
    {
        super(scope, id, props);

        this.instancesHandlingRequestsInThisAZ = AvailabilityAndLatencyAlarmsAndRules.createServerSideInstancesHandlingRequestsInThisAZRule(
            this,
            props.availabilityMetricDetails.operation,
            props.availabilityZoneId,
            props.contributorInsightRuleDetails,
            props.nameSuffix,
            props.counter
        );
        this.instanceContributorsToFaultsInThisAZ = AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceFaultContributorsInThisAZRule(
            this,
            props.availabilityMetricDetails.operation,
            props.availabilityZoneId,
            props.contributorInsightRuleDetails,
            props.nameSuffix,
            props.counter
        );
        this.multipleInstancesProducingFaultsInThisAvailabilityZone = AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
            this,
            props.availabilityMetricDetails,
            props.availabilityZoneId,
            props.nameSuffix,
            props.counter,
            props.outlierThreshold,
            this.instanceContributorsToFaultsInThisAZ,
            this.instancesHandlingRequestsInThisAZ
        );
        this.instanceContributorsToHighLatencyInThisAZ = AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceHighLatencyContributorsInThisAZRule(
            this,
            props.latencyMetricDetails,
            props.availabilityZoneId,
            props.contributorInsightRuleDetails,
            props.nameSuffix,
            props.counter
        );
        this.multipleInstancesProducingHighLatencyInThisAZ = AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
            this,
            props.latencyMetricDetails,
            props.availabilityZoneId,
            props.nameSuffix,
            props.counter,
            props.outlierThreshold,
            this.instanceContributorsToHighLatencyInThisAZ,
            this.instancesHandlingRequestsInThisAZ
        );
        
        this.isolatedImpactAlarm = AvailabilityAndLatencyAlarmsAndRules.createServerSideIsolatedAZImpactAlarm(
            this,
            props.availabilityMetricDetails.operation,
            props.availabilityZoneId,
            props.nameSuffix,
            props.counter,
            this.availabilityZoneIsOutlierForFaults,
            this.availabilityAlarm,
            this.multipleInstancesProducingFaultsInThisAvailabilityZone,
            this.availabilityZoneIsOutlierForLatency,
            this.latencyAlarm,
            this.multipleInstancesProducingHighLatencyInThisAZ
        );
    }
}