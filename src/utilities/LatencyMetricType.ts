/**
 * The type of latency metric
 */
export enum LatencyMetricType {
  /**
   * Successful response latency
   */
  SUCCESS_LATENCY = "Success_Latency",

  /**
   * Fault response latency
   */
  FAULT_LATENCY = "Fault_Latency",
}
