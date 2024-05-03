import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IService } from "../IService";
import { AvailabilityZoneMapper } from "../../utilities/AvailabilityZoneMapper";
import { Duration } from "aws-cdk-lib";

export interface IInstrumentedServiceProps
{
    service: IService;

    createDashboard: boolean;

    outlierThreshold: number;

    loadBalancer: ILoadBalancerV2;

    availabilityZoneMapper: AvailabilityZoneMapper;

    interval: Duration;
}