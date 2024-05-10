import { Duration } from "aws-cdk-lib";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { IOperation } from "../../services/IOperation";
import { IOperationMetricDetails } from "../../services/IOperationMetricDetails";
/**
 * Props for creating operation dashboard availability and latency widgets
 */
export interface OperationAvailabilityAndLatencyWidgetProps {
    /**
     * The operation for this widget
     */
    readonly operation: IOperation;
    /**
     * The availability metric details
     */
    readonly availabilityMetricDetails: IOperationMetricDetails;
    /**
     * The latency metric details
     */
    readonly latencyMetricDetails: IOperationMetricDetails;
    /**
     * The number of AZs being used
     */
    readonly availabilityZoneIds: string[];
    /**
     * The resolution period
     */
    readonly resolutionPeriod: Duration;
    /**
     * The interval for the widget
     */
    readonly interval: Duration;
    /**
     * An alarm per AZ for availability
     */
    readonly zonalEndpointAvailabilityAlarms: IAlarm[];
    /**
     * An alarm per AZ for latency
     */
    readonly zonalEndpointLatencyAlarms: IAlarm[];
    /**
     * The regional endpoint availability alarm
     */
    readonly regionalEndpointAvailabilityAlarm: IAlarm;
    /**
     * The regional endpoint latency alarm
     */
    readonly regionalEndpointLatencyAlarm: IAlarm;
    /**
     * Instance contributors to high latency, only set for
     * server-side widgets
     */
    readonly instanceContributorsToHighLatency?: CfnInsightRule;
    /**
     * Instance contributors to faults, only set for
     * server-side widgets
     */
    readonly instanceContributorsToFaults?: CfnInsightRule;
    /**
     * Is this widget for the canary metrics
     */
    readonly isCanary: boolean;
}
