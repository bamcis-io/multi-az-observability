import { Construct } from "constructs";
import { BaseOperationZonalAlarmsAndRules } from "./BaseOperationZonalAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRulesProps } from "./ICanaryOperationZonalAlarmsAndRulesProps";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRules } from "./ICanaryOperationZonalAlarmsAndRules";

/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
export class CanaryOperationZonalAlarmsAndRules extends BaseOperationZonalAlarmsAndRules implements ICanaryOperationZonalAlarmsAndRules
{
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