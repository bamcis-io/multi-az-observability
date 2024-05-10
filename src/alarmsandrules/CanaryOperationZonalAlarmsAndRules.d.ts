import { Construct } from "constructs";
import { BaseOperationZonalAlarmsAndRules } from "./BaseOperationZonalAlarmsAndRules";
import { CanaryOperationZonalAlarmsAndRulesProps } from "./props/CanaryOperationZonalAlarmsAndRulesProps";
import { ICanaryOperationZonalAlarmsAndRules } from "./ICanaryOperationZonalAlarmsAndRules";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
export declare class CanaryOperationZonalAlarmsAndRules extends BaseOperationZonalAlarmsAndRules implements ICanaryOperationZonalAlarmsAndRules {
    /**
     * Alarm that triggers if either latency or availability breach the specified
     * threshold in this AZ and the AZ is an outlier for faults or latency
     */
    isolatedImpactAlarm: IAlarm;
    constructor(scope: Construct, id: string, props: CanaryOperationZonalAlarmsAndRulesProps);
}
