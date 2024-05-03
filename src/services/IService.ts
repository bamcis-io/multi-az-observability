import { Duration } from "aws-cdk-lib";
import { IOperation } from "./IOperation";

export interface IService
{
    /**
     * The name of your service
     */
    serviceName: string;

    /**
     * The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
     */
    endpoint: URL;

    /**
     * The fault count threshold that indicates the service is unhealthy. This is an absolute value of faults
     * being produced by all critical operations in aggregate.
     */
    faultCountThreshold: number;

    /**
     * A list of the Availability Zone Ids used by this application
     */
    availabilityZoneIds: string[];

    /**
     * The period for which metrics for the service should be aggregated 
     */
     period: Duration;

    /**
     * The operations that are part of this service
     */
    operations: IOperation[];

    /**
     * The operations considered critical to the service. Operations that included here
     * should also be in the "operations" property.
     */
    criticalOperations: IOperation[];

    /**
     * Adds an operation to this service and sets the operation's
     * service property
     */
    addOperation(operation: IOperation): IService;

    /**
     * Adds a critical operation (and adds to the overall operations) and
     * sets the operation's service property
     */
    addCriticalOperation(operation: IOperation): IService;
}