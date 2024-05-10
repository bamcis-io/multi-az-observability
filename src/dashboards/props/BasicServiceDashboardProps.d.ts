import { Duration } from "aws-cdk-lib";
import { IAlarm, IMetric } from "aws-cdk-lib/aws-cloudwatch";
export interface BasicServiceDashboardProps {
    readonly serviceName: string;
    readonly zonalLoadBalancerIsolatedImpactAlarms?: {
        [key: string]: IAlarm;
    };
    readonly zonalNatGatewayIsolatedImpactAlarms?: {
        [key: string]: IAlarm;
    };
    readonly zonalAggregateIsolatedImpactAlarms: {
        [key: string]: IAlarm;
    };
    readonly zonalLoadBalancerFaultRateMetrics?: {
        [key: string]: IMetric;
    };
    readonly zonalNatGatewayPacketDropMetrics?: {
        [key: string]: IMetric;
    };
    readonly interval?: Duration;
}
