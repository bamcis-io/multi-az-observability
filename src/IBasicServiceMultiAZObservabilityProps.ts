import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { OutlierDetectionAlgorithm } from "./utilities/OutlierDetectionAlgorithm";
import { Duration } from "aws-cdk-lib";

/**
 * Properties for creating a basic service
 */
export interface IBasicServiceMultiAZObservabilityProps
{
    /**
     * (Optional) A map of Availability Zone name to the NAT Gateways
     * in that AZ
     */
    natGateways: {[key: string]: CfnNatGateway[]};

    /**
     * The application load balancers being used by the service
     */
    applicationLoadBalancers: IApplicationLoadBalancer[];

    /**
     * The service's name
     */
    serviceName: string;

    /**
     * The threshold for percentage of errors or packet loss to
     * determine if an AZ is an outlier, should be a number between 
     * 0 and 1
     */
    outlierThreshold: number;

    /**
     * The amount of packet loss in a NAT GW to determine if an AZ
     * is actually impacted, recommendation is 0.01%
     */
    packetLossImpactPercentageThreshold: number;

    /**
     * The percentage of faults for a single ALB to consider an AZ
     * to be unhealthy, this should align with your availability goal
     */
    faultCountPercentageThreshold: number;

    /**
     * The algorithm to use for performing outlier detection
     */
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm;

    /**
     * The period to evaluate metrics
     */
    period: Duration;
}