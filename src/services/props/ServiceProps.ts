import { Duration } from "aws-cdk-lib";

/**
 * Properties to initialize a service
 */
export interface ServiceProps
{
    /**
     * The name of your service
     */
    readonly serviceName: string;

    /**
     * The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
     */
    readonly baseUrl: string;

    /**
     * The fault count threshold that indicates the service is unhealthy. This is an absolute value of faults
     * being produced by all critical operations in aggregate.
     */
    readonly faultCountThreshold: number;

    /**
     * A list of the Availability Zone names used by this application
     */
    readonly availabilityZoneNames: string[];

    /**
     * The period for which metrics for the service should be aggregated 
     */
    readonly period: Duration;
}