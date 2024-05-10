/**
 * Different availability metric types
 */
export declare enum AvailabilityMetricType {
    /**
     * The success rate, i.e. (successful responses) / (successful + fault responses) * 100
     */
    SUCCESS_RATE = 0,
    /**
     * The number of success responses as an absolute value
     */
    SUCCESS_COUNT = 1,
    /**
     * The fault rate, i.e. (fault responses) / (successful + fault responses) * 100
     */
    FAULT_RATE = 2,
    /**
     * The number of fault responses as an absolute value
     */
    FAULT_COUNT = 3,
    /**
     * The number of requests received that resulted in either a fault or success. This
     * does not include "error" responses that would be equivalent to 4xx responses.
     */
    REQUEST_COUNT = 4
}
