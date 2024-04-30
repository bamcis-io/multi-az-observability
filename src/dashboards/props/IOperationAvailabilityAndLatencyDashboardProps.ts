import { IOperation } from "../../IOperation";
import { Duration } from "aws-cdk-lib";
import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IAlarm, CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";

/**
 * Properties for creating an availability and latency dashboard for 
 * a single operation
 */
export interface IOperationAvailabilityAndLatencyDashboardProps
{
    /**
     * The operation for this dashboard
     */
    operation: IOperation;

    /**
     * The AZ Map of AZ name to AZ Id
     */
    azMap: string;

    /**
     * A comma delimited list of the Availability Zone Ids being used
     */
    azIdList: string;

    /**
     * The number of Availability Zones being used
     */
    azCount: number;

    /**
     * The interval of the dashboard
     */
    interval: Duration;

    /**
     * (Optional) The load balancer supporting this operation, if this is not 
     * provided, no load balancer metrics will be shown
     */
    loadBalancer: ILoadBalancerV2;

    /**
     * Per AZ server-side availability alarms
     */
    zonalEndpointServerAvailabilityAlarms: IAlarm[];

    /**
     * Per AZ server-side latency alarms
     */
    zonalEndpointServerLatencyAlarms: IAlarm[];

    /**
     * Per AZ canary availability alarms
     */
    zonalEndpointCanaryAvailabilityAlarms: IAlarm[];

    /**
     * Per AZ canary latency alarms
     */
    zonalEndpointCanaryLatencyAlarms: IAlarm[];

    /**
     * Regional server-side availability alarm
     */
    regionalEndpointServerAvailabilityAlarm: IAlarm;

    /**
     * Regional server-side latency alarm
     */
    regionalEndpointServerLatencyAlarm: IAlarm;

    /**
     * Regional canary availability alarm
     */
    regionalEndpointCanaryAvailabilityAlarm: IAlarm;

    /**
     * Regional canary latency alarm
     */
    regionalEndpointCanaryLatencyAlarm: IAlarm;

    /**
     * Per AZ alarms that indicate isolated single AZ impact
     */
    isolatedAZImpactAlarms: IAlarm[];

    /**
     * Alarm that indicates regional impact
     */
    regionalImpactAlarm: IAlarm;

    /**
     * Insight rule that shows instance contributors to 
     * high latency for this operation
     */
    instanceContributorsToHighLatency: CfnInsightRule;

    /**
     * Insight rule that shows instance contributors to
     * faults for this operation
     */
    instanceContributorsToFaults: CfnInsightRule;
}