import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IOperation } from "../../services/IOperation";
import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IAvailabilityZoneMapper } from "../../utilities/IAvailabilityZoneMapper";

/**
 * The props for creating a canary test on a single operation
 */
export interface CanaryTestProps
{
    /**
     * The function that will run the canary requests
     */
    readonly function: IFunction;

    /**
     * The number of requests to send on each test
     */
    readonly requestCount: number;

    /**
     * A schedule expression
     */
    readonly schedule: string;

    /**
     * Data to supply in a POST, PUT, or PATCH operation
     */
    readonly postData?: string;

    /**
     * Any headers to include
     */
    readonly headers?: {[key: string]: string};

    /**
     * The operation being tested
     */
    readonly operation: IOperation;

    /**
     * The load balancer that will be tested against
     */
    readonly loadBalancer: ILoadBalancerV2;

    /**
     * The Availability Zone mapper object
     */
    readonly availabilityZoneMapper: IAvailabilityZoneMapper;

    /**
     * The Availability Zones being used
     */
    readonly availabilityZoneIds: string[];
}