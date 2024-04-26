import { Construct } from "constructs";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IBaseOperationRegionalAlarmsAndRulesProps } from "./IBaseOperationRegionalAlarmsAndRulesProps";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";

/**
 * Base operation regional alarms and rules
 */
export abstract class BaseOperationRegionalAlarmsAndRules extends Construct
{
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

    constructor(scope: Construct, id: string, props: IBaseOperationRegionalAlarmsAndRulesProps)
    {
        super(scope, id);

        this.availabilityAlarm = AvailabilityAndLatencyAlarmsAndRules.createRegionalAvailabilityAlarm(this, props.availabilityMetricDetails, props.nameSuffix);
        this.latencyAlarm = AvailabilityAndLatencyAlarmsAndRules.createRegionalLatencyAlarm(this, props.latencyMetricDetails, props.nameSuffix);
        this.availabilityOrLatencyAlarm = AvailabilityAndLatencyAlarmsAndRules.createRegionalCustomerExperienceAlarm(this, props.availabilityMetricDetails.operation, props.nameSuffix, this.availabilityAlarm, this.latencyAlarm);
    }
}