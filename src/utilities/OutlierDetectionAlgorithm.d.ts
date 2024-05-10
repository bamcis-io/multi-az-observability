/**
 * Available algorithms for performing outlier detection, currently
 * only STATIC is supported
 */
export declare enum OutlierDetectionAlgorithm {
    /**
     * Defines using a static value to compare skew in faults or
     * high latency responses
     */
    STATIC = 0,
    /**
     * Uses the chi squared statistic to determine if there is a statistically
     * significant skew in fault rate or high latency distribution
     */
    CHI_SQUARED = 1,
    /**
     * Uses z-score to determine if the skew in faults or high latency respones
     * exceeds a defined number of standard devations (typically 3)
     */
    Z_SCORE = 2
}
