import { IOperation } from "../../IOperation";
import { IOperationAvailabilityAndLatencyDashboardProps } from "./IOperationAvailabilityAndLatencyDashboardProps";
import { IOperationAvailabilityAndLatencyWidgetProps } from "./IOperationAvailabilityAndLatencyWidgetProps";
import { IOperationMetricDetails } from "../../IOperationMetricDetails";
import { Duration } from "aws-cdk-lib";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";

/**
 * Props for creating operation dashboard availability and latency widgets
 */
export class OperationAvailabilityAndLatencyWidgetProps implements IOperationAvailabilityAndLatencyWidgetProps
{
    /**
     * The operation for this widget
     */
    operation: IOperation;

    /**
     * The availability metric details
     */
    availabilityMetricDetails: IOperationMetricDetails;

    /**
     * The latency metric details
     */
    latencyMetricDetails: IOperationMetricDetails;

    /**
     * The number of AZs being used
     */
    azCount: number;

    /**
     * A comma delimited list of the AZ Ids
     */
    availabilityZoneIdList: string;

    /**
     * The resolution period
     */
    resolutionPeriod: Duration;

    /**
     * The interval for the widget
     */
    interval: Duration;

    /**
     * An alarm per AZ for availability
     */
    zonalEndpointAvailabilityAlarms: IAlarm[];

    /**
     * An alarm per AZ for latency
     */
    zonalEndpointLatencyAlarms: IAlarm[];

    /**
     * The regional endpoint availability alarm
     */
    regionalEndpointAvailabilityAlarm: IAlarm;

    /**
     * The regional endpoint latency alarm
     */
    regionalEndpointLatencyAlarm: IAlarm;

    /**
     * Instance contributors to high latency, only set for
     * server-side widgets
     */
    instanceContributorsToHighLatency: CfnInsightRule;

    /**
     * Instance contributors to faults, only set for
     * server-side widgets
     */
    instanceContributorsToFaults: CfnInsightRule;

    /**
     * Is this widget for the canary metrics
     */
    isCanary: boolean;

    constructor(props: IOperationAvailabilityAndLatencyDashboardProps, isCanary: boolean)
    {
        this.isCanary = isCanary;
        this.operation = props.operation;
        this.availabilityMetricDetails = isCanary ? props.operation.canaryAvailabilityMetricDetails : props.operation.serverSideAvailabilityMetricDetails;
        this.latencyMetricDetails = isCanary ? props.operation.canaryLatencyMetricDetails : props.operation.serverSideLatencyMetricDetails;
        this.azCount = props.azCount;
        this.availabilityZoneIdList = props.azIdList;
        this.interval = props.interval;
        this.zonalEndpointAvailabilityAlarms = isCanary ? props.zonalEndpointCanaryAvailabilityAlarms : props.zonalEndpointServerAvailabilityAlarms;
        this.zonalEndpointLatencyAlarms = isCanary ? props.zonalEndpointCanaryLatencyAlarms : props.zonalEndpointServerLatencyAlarms;
        this.regionalEndpointAvailabilityAlarm = isCanary ? props.regionalEndpointCanaryAvailabilityAlarm : props.regionalEndpointServerAvailabilityAlarm;
        this.regionalEndpointLatencyAlarm = isCanary ? props.regionalEndpointCanaryLatencyAlarm : props.regionalEndpointServerLatencyAlarm;
        this.instanceContributorsToHighLatency = props.instanceContributorsToHighLatency;
        this.instanceContributorsToFaults = props.instanceContributorsToFaults;
    }
}