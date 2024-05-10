import { AvailabilityAndLatencyMetricProps } from './AvailabilityAndLatencyMetricProps';
import { AvailabilityMetricType } from '../../utilities/AvailabilityMetricType';

/**
 * Metric properties for availability metrics
 */
export interface AvailabilityMetricProps extends AvailabilityAndLatencyMetricProps
{
  /**
     * The type of availability metric
     */
  readonly metricType: AvailabilityMetricType;
}