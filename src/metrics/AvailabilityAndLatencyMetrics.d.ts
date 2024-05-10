import { RegionalAvailabilityMetricProps } from "./props/RegionalAvailabilityMetricProps";
import { ZonalAvailabilityMetricProps } from "./props/ZonalAvailabilityMetricProps";
import { IMetric } from "aws-cdk-lib/aws-cloudwatch";
import { ZonalLatencyMetricProps } from "./props/ZonalLatencyMetricProps";
import { RegionalLatencyMetricProps } from "./props/RegionalLatencyMetricProps";
import { ServiceAvailabilityMetricProps } from "./props/ServiceAvailabilityMetricProps";
import { Duration } from "aws-cdk-lib";
/**
 * Class for creating availability and latency metrics that can be used in alarms and graphs
 */
export declare class AvailabilityAndLatencyMetrics {
    /**
     * Creates a zonal availability metric
     * @param props
     * @returns
     */
    static createZonalAvailabilityMetric(props: ZonalAvailabilityMetricProps): IMetric;
    /**
     * Creates a regional availability metric
     * @param props
     * @returns
     */
    static createRegionalAvailabilityMetric(props: RegionalAvailabilityMetricProps): IMetric;
    /**
     * General purpose method to create availability metrics
     * @param props
     * @param dimensions
     * @returns
     */
    private static createAvailabilityMetric;
    /**
     * Creates a zonal latency metric
     * @param props
     * @returns
     */
    static createZonalLatencyMetrics(props: ZonalLatencyMetricProps): IMetric[];
    /**
     * Creates a regional latency metric
     * @param props
     * @returns
     */
    static createRegionalLatencyMetrics(props: RegionalLatencyMetricProps): IMetric[];
    /**
     * General purpose method to create latency metrics
     * @param props
     * @param dimensions
     * @returns
     */
    private static createLatencyMetrics;
    /**
     * Creates a regional service level availability metrics, one metric for
     * each operation at the regional level and the service.
     * @param props
     * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
     * are the metrics for each operation included in the request availability metric props.
     */
    static createRegionalServiceAvailabilityMetrics(props: ServiceAvailabilityMetricProps): IMetric[];
    /**
     * Creates a zonal service level availability metrics, one metric for
     * each operation at the zonal level and the service.
     * @param props
     * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
     * are the metrics for each operation included in the request availability metric props.
     */
    static createZonalServiceAvailabilityMetrics(props: ServiceAvailabilityMetricProps): IMetric[];
    /**
     * Creates a regional fault count metric using 5xx target and load balancer
     * metrics against total requests for the specified load balancer
     * @param period
     * @param loadBalancerFullName
     * @returns
     */
    static createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName: string, period: Duration): IMetric;
    /**
     * Creates a zonal fault count metric using 5xx target and load balancer
     * metrics against total requests for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns
     */
    static createZonalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName: string, availabilityZoneName: string, period: Duration): IMetric;
    /**
     * Creates a regional processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param period
     * @returns
     */
    static createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName: string, period: Duration): IMetric;
    /**
     * Creates a zonal processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns
     */
    static createZonalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName: string, availabilityZoneName: string, period: Duration): IMetric;
    /**
     * Increments a str by one char, for example
     * a -> b
     * z -> aa
     * ad -> ae
     *
     * This wraps at z and adds a new 'a'
     * @param str
     * @returns
     */
    static nextChar(str: string): string;
}
