import { Construct } from "constructs";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { BaseOperationZonalAlarmsAndRulesProps } from "./props/BaseOperationZonalAlarmsAndRulesProps";
import { IBaseOperationZonalAlarmsAndRules } from "./IBaseOperationZonalAlarmsAndRules";
/**
 * The base operation regional alarms and rules
 */
export declare abstract class BaseOperationZonalAlarmsAndRules extends Construct implements IBaseOperationZonalAlarmsAndRules {
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
    constructor(scope: Construct, id: string, props: BaseOperationZonalAlarmsAndRulesProps);
}
