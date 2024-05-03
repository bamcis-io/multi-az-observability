import { Duration } from "aws-cdk-lib";
import { IAlarm, IMetric } from "aws-cdk-lib/aws-cloudwatch";

export interface IBasicServiceDashboardProps
{
    serviceName: string;

    zonalLoadBalancerIsolatedImpactAlarms?: {[key:string]: IAlarm};

    zonalNatGatewayIsolatedImpactAlarms?: {[key:string]: IAlarm};

    zonalAggregateIsolatedImpactAlarms: {[key:string]: IAlarm};

    zonalLoadBalancerFaultRateMetrics?: {[key:string]: IMetric};

    zonalNatGatewayPacketDropMetrics?: {[key:string]: IMetric};

    interval?: Duration;
}