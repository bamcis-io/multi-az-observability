import { Construct } from "constructs";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { IBaseOperationZonalAlarmsAndRulesProps } from "./IBaseOperationZonalAlarmsAndRulesProps";
import { IBaseOperationZonalAlarmsAndRules } from "./IBaseOperationZonalAlarmsAndRules";

/**
 * The base operation regional alarms and rules
 */
export abstract class BaseOperationZonalAlarmsAndRules extends Construct implements IBaseOperationZonalAlarmsAndRules
{
    /**
     * Composite alarm for either availabiltiy or latency impact to this operation
     */
    availabilityOrLatencyAlarm: IAlarm;

    /**
     * Availability alarm for this operation
     */
    availabilityAlarm: IAlarm;

    /**
     * Latency alarm for this operation
     */
    latencyAlarm: IAlarm;

    /**
     * Alarm that triggers if either latency or availability breach the specified
     * threshold in this AZ and the AZ is an outlier for faults or latency
     */
    isolatedImpactAlarm: IAlarm;

    /**
     * Alarm that indicates that this AZ is an outlier for fault rate
     */
    availabilityZoneIsOutlierForFaults: IAlarm;

    /**
     * Alarm that indicates this AZ is an outlier for high latency
     */
    availabilityZoneIsOutlierForLatency: IAlarm;

    /**
     * The Availability Zone Id for the alarms and rules
     */
    availabilityZoneId: string;

    constructor(scope: Construct, id: string, props: IBaseOperationZonalAlarmsAndRulesProps)
    {
        super(scope, id)
        this.availabilityZoneId = props.availabilityZoneId;
        this.availabilityAlarm = AvailabilityAndLatencyAlarmsAndRules.createZonalAvailabilityAlarm(this, props.availabilityMetricDetails, props.availabilityZoneId, props.nameSuffix, props.counter);
        this.latencyAlarm = AvailabilityAndLatencyAlarmsAndRules.createZonalLatencyAlarm(this, props.latencyMetricDetails, props.availabilityZoneId, props.nameSuffix, props.counter);
        this.availabilityOrLatencyAlarm = AvailabilityAndLatencyAlarmsAndRules.createZonalAvailabilityOrLatencyCompositeAlarm(this, props.availabilityMetricDetails.operation, props.availabilityZoneId, props.nameSuffix, props.counter, this.availabilityAlarm, this.latencyAlarm);
        this.availabilityZoneIsOutlierForFaults = AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateOutlierAlarm(this, props.availabilityMetricDetails, props.availabilityZoneId, props.nameSuffix, props.counter, props.outlierThreshold);
        this.availabilityZoneIsOutlierForLatency = AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyOutlierAlarm(this, props.latencyMetricDetails, props.availabilityZoneId, props.nameSuffix, props.counter, props.outlierThreshold);
    }
}