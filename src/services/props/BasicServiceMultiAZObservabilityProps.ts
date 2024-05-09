import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { OutlierDetectionAlgorithm } from "../../utilities/OutlierDetectionAlgorithm";
import { Duration } from "aws-cdk-lib";

/**
 * Properties for creating a basic service
 */
export interface BasicServiceMultiAZObservabilityProps
{
    /**
     * (Optional) A map of Availability Zone name to the NAT Gateways
     * in that AZ
     * 
     * @default - No alarms for NAT Gateways will be created
     */
    readonly natGateways?: {[key: string]: CfnNatGateway[]};

    /**
     * The application load balancers being used by the service
     * 
     * @default - No alarms for ALBs will be created
     */
    readonly applicationLoadBalancers?: IApplicationLoadBalancer[];

    /**
     * The service's name
     */
    readonly serviceName: string;

    /**
     * The threshold for percentage of errors or packet loss to
     * determine if an AZ is an outlier, should be a number between 
     * 0 and 1
     */
    readonly outlierThreshold: number;

    /**
     * The amount of packet loss in a NAT GW to determine if an AZ
     * is actually impacted, recommendation is 0.01%
     * 
     * @default - 0.01 (as in 0.01%)
     */
    readonly packetLossImpactPercentageThreshold?: number;

    /**
     * The percentage of faults for a single ALB to consider an AZ
     * to be unhealthy, this should align with your availability goal. For example
     * 1% or 5%.
     * 
     * @default - 5 (as in 5%)
     */
    readonly faultCountPercentageThreshold?: number;

    /**
     * The algorithm to use for performing outlier detection
     */
    readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;

    /**
     * The period to evaluate metrics
     */
    readonly period: Duration;

    /**
     * Whether to create a dashboard displaying the metrics and alarms
     */
    readonly createDashboard: boolean;

    /**
     * Dashboard interval
     * 
     * @default - 1 hour
     */
    readonly interval?: Duration;
}