import { Construct } from "constructs";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { BaseOperationRegionalAlarmsAndRulesProps } from "./props/BaseOperationRegionalAlarmsAndRulesProps";
import { IBaseOperationRegionalAlarmsAndRules } from "./IBaseOperationRegionalAlarmsAndRules";
/**
 * Base operation regional alarms and rules
 */
export declare abstract class BaseOperationRegionalAlarmsAndRules extends Construct implements IBaseOperationRegionalAlarmsAndRules {
    /**
     * Availability alarm for this operation
     */
    availabilityAlarm: IAlarm;
    /**
     * Latency alarm for this operation
     */
    latencyAlarm: IAlarm;
    /**
     * Composite alarm for either availabiltiy or latency impact to this operation
     */
    availabilityOrLatencyAlarm: IAlarm;
    constructor(scope: Construct, id: string, props: BaseOperationRegionalAlarmsAndRulesProps);
}
