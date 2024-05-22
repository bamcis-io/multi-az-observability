import { Duration } from 'aws-cdk-lib';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { OutlierDetectionAlgorithm } from '../../utilities/OutlierDetectionAlgorithm';

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
     * The outlier threshold for determining if an AZ is an
     * outlier for latency or faults. This number is interpreted
     * differently for different outlier algorithms. When used with
     * STATIC, the number should be between 0 and 1 to represent the
     * percentage of errors (like .7) that an AZ must be responsible
     * for to be considered an outlier. When used with CHI_SQUARED, it
     * represents the p value that indicates statistical significance, like
     * 0.05 which means the skew has less than or equal to a 5% chance of
     * occuring. When used with Z_SCORE it indicates how many standard
     * deviations to evaluate for an AZ being an outlier, typically 3 is
     * standard for Z_SCORE.
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