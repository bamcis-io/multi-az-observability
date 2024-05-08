import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IService } from "../IService";
import { Duration } from "aws-cdk-lib";
import { IAvailabilityZoneMapper } from "../../utilities/IAvailabilityZoneMapper";

export interface IInstrumentedServiceProps
{
    service: IService;

    createDashboard: boolean;

    outlierThreshold: number;

    loadBalancer: ILoadBalancerV2;

    availabilityZoneMapper: IAvailabilityZoneMapper;

    interval: Duration;

    addSyntheticCanaries?: boolean;
}