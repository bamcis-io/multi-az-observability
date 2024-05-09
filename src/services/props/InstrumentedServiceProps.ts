import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IService } from "../IService";
import { Duration } from "aws-cdk-lib";
import { IAvailabilityZoneMapper } from "../../utilities/IAvailabilityZoneMapper";

/**
 * The properties for adding alarms and dashboards
 * for an instrumented service.
 */
export interface InstrumentedServiceProps
{
    /**
     * The service that the alarms and dashboards are being crated for.
     */
    readonly service: IService;

    /**
     * Indicates whether to create per operation and overall service 
     * dashboards.
     */
    readonly createDashboard: boolean;

    /**
     * The threshold as a percentage between 0 and 1
     * on when to consider an AZ as an outlier for
     * faults or high latency responses
     */
    readonly outlierThreshold: number;

    /**
     * The load balancer used by the service
     */
    readonly loadBalancer: ILoadBalancerV2;

    /**
     * The Availability Zone mapper custom resources
     * used to map AZ names to ids.
     */
    readonly availabilityZoneMapper: IAvailabilityZoneMapper;

    /**
     * The interval used in the dashboard, defaults to
     * 60 minutes.
     * 
     * @default - 60 minutes
     */
    readonly interval?: Duration;

    /**
     * An option to automatically create synthetic canaries to test each 
     * operation in each AZ as well as via the regional
     * 
     * @default - No synthetic canaries are created
     */
    readonly addSyntheticCanaries?: boolean;
}