import { Duration } from "aws-cdk-lib";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { IOperation } from "../../services/IOperation";
import { IOperationMetricDetails } from "../../services/IOperationMetricDetails";

/**
 * Props for creating operation dashboard availability and latency widgets
 */
export interface IOperationAvailabilityAndLatencyWidgetProps
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
    availabilityZoneIds: string[];

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
    instanceContributorsToHighLatency?: CfnInsightRule;

    /**
     * Instance contributors to faults, only set for
     * server-side widgets
     */
    instanceContributorsToFaults?: CfnInsightRule;

    /**
     * Is this widget for the canary metrics
     */
    isCanary: boolean;
}