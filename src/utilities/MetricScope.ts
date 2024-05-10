export enum MetricScope
  {
  /**
     * The metric scope is for an operation in a single Availability Zone
     */
  OPERATION_ZONAL,

  /**
     * The metric scope is for an operation in the whole Region
     */
  OPERATION_REGIONAL,

  /**
     * The metric scope is for a service in a single Availability Zone
     */
  SERVICE_ZONAL,

  /**
     * The metric scope is for a service in the whole Region
     */
  SERVICE_REGIONAL
}