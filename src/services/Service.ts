import { Duration } from "aws-cdk-lib";
import { IOperation } from "./IOperation";
import { ServiceProps } from "./props/ServiceProps";
import { IService } from "./IService";

/**
 * The representation of a service composed of multiple operations
 */
export class Service implements IService
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

    /**
     * The operations that are part of this service
     */
    readonly operations: IOperation[];

    /**
     * Adds an operation to this service and sets the operation's
     * service property
     */
    addOperation(operation: IOperation): IService
    {
        this.operations.push(operation);
        return this;
    }

    constructor(props: ServiceProps)
    {
        this.serviceName = props.serviceName;
        this.availabilityZoneNames = props.availabilityZoneNames;
        this.baseUrl = props.baseUrl;
        this.faultCountThreshold = props.faultCountThreshold;
        this.operations = [];
        this.period = props.period;
    }
}