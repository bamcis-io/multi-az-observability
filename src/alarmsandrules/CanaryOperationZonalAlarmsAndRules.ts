import { Construct } from "constructs";
import { BaseOperationZonalAlarmsAndRules } from "./BaseOperationZonalAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRulesProps } from "./props/ICanaryOperationZonalAlarmsAndRulesProps";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRules } from "./ICanaryOperationZonalAlarmsAndRules";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";

/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
export class CanaryOperationZonalAlarmsAndRules extends BaseOperationZonalAlarmsAndRules implements ICanaryOperationZonalAlarmsAndRules
{
    /**
     * Alarm that triggers if either latency or availability breach the specified
     * threshold in this AZ and the AZ is an outlier for faults or latency
     */
    isolatedImpactAlarm: IAlarm;

    constructor(scope: Construct, id: string, props: ICanaryOperationZonalAlarmsAndRulesProps)
    {
        super(scope, id, props);

        this.isolatedImpactAlarm = AvailabilityAndLatencyAlarmsAndRules.createCanaryIsolatedAZImpactAlarm(
            this, 
            props.availabilityMetricDetails.operation,
            props.availabilityZoneId,
            props.nameSuffix,
            props.counter,
            this.availabilityZoneIsOutlierForFaults,
            this.availabilityAlarm,
            this.availabilityZoneIsOutlierForLatency,
            this.latencyAlarm 
        )
    }
}