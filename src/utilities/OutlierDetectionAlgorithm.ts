/**
 * Available algorithms for performing outlier detection, currently
 * only STATIC is supported
 */
export enum OutlierDetectionAlgorithm
  {
  /**
     * Defines using a static value to compare skew in faults or
     * high latency responses
     */
  STATIC,

  /**
     * Uses the chi squared statistic to determine if there is a statistically
     * significant skew in fault rate or high latency distribution
     */
  CHI_SQUARED,

  /**
     * Uses z-score to determine if the skew in faults or high latency respones
     * exceeds a defined number of standard devations (typically 3)
     */
  Z_SCORE
}