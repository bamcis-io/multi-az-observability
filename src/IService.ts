import { IOperation } from "./IOperation";
import { Duration } from "aws-cdk-lib";

export interface IService {
    /**
     * The name of the service
     */
    serviceName: string;

    /**
     * The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
     */
    endpoint: URL;

    /**
     * The operations that make up the service
     */
    operations: IOperation[];

    /**
     * The fault count threshold that indicates the service is unhealthy. This is an absolute value of faults
     * being produced by all critical operations in aggregate.
     */
    faultCountThreshold: number;

    /**
     * The operations considered critical to the service. Operations that included here
     * should also be in the "operations" property.
     */
    criticalOperations: IOperation[];

    /**
     * A comma delimited list of the Availability Zone Ids used by this application
     */
    availabilityZoneIdList: string;

    /**
     * The number of Availability Zones included in the availabilityZoneIdList
     */
    azCount: number;

    /**
     * The period for which metrics for the service should be aggregated 
     */
    period: Duration;

    /**
     * Adds an operation to this service
     * @param operation 
     */
    AddOperation(operation: IOperation): IService;

    /**
     * Adds a critical operation to this service
     * @param operation 
     */
    AddCriticalOperation(operation: IOperation): IService;

    /**
     * Gets the Availability Zone Id from the "availabilityZoneIdList" property
     * from the designated index in the comma delimited list
     * @param index 
     */
    GetAvailabilityZoneIdAtIndex(index: number): string;
}