import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IOperation } from "../../services/IOperation";
import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IAvailabilityZoneMapper } from "../../utilities/IAvailabilityZoneMapper";

export interface ICanaryTestProps
{
    /**
     * The function that will run the canary requests
     */
    function: IFunction;

    /**
     * The number of requests to send on each test
     */
    requestCount: number;

    /**
     * A schedule expression
     */
    schedule: string;

    /**
     * Data to supply in a POST, PUT, or PATCH operation
     */
    postData?: string;

    /**
     * Any headers to include
     */
    headers?: {[key: string]: string};

    /**
     * The operation being tested
     */
    operation: IOperation;

    /**
     * The load balancer that will be tested against
     */
    loadBalancer: ILoadBalancerV2;

    /**
     * The Availability Zone mapper object
     */
    availabilityZoneMapper: IAvailabilityZoneMapper;

    /**
     * The Availability Zones being used
     */
    availabilityZoneIds: string[];
}