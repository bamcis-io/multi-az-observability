export declare enum MetricScope {
    /**
     * The metric scope is for an operation in a single Availability Zone
     */
    OPERATION_ZONAL = 0,
    /**
     * The metric scope is for an operation in the whole Region
     */
    OPERATION_REGIONAL = 1,
    /**
     * The metric scope is for a service in a single Availability Zone
     */
    SERVICE_ZONAL = 2,
    /**
     * The metric scope is for a service in the whole Region
     */
    SERVICE_REGIONAL = 3
}
