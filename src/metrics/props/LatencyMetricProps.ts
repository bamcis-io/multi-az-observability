import { AvailabilityAndLatencyMetricProps } from "./AvailabilityAndLatencyMetricProps";
import { LatencyMetricType } from "../../utilities/LatencyMetricType";

/**
 * Metric properties for latency metrics
 */
export interface LatencyMetricProps extends AvailabilityAndLatencyMetricProps {
  /**
   * The type of latency metric
   */
  readonly metricType: LatencyMetricType;

  /**
   * The latency statistic like p99, tm99, or TC(100:)
   */
  readonly statistic: string;
}
