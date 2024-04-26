/**
 * Different availability metric types
 */
export enum AvailabilityMetricType
{
    /**
     * The success rate, i.e. (successful responses) / (successful + fault responses) * 100
     */
    SUCCESS_RATE,

    /**
     * The number of success responses as an absolute value
     */
    SUCCESS_COUNT,

    /**
     * The fault rate, i.e. (fault responses) / (successful + fault responses) * 100
     */
    FAULT_RATE,

    /**
     * The number of fault responses as an absolute value
     */
    FAULT_COUNT,

    /**
     * The number of requests received that resulted in either a fault or success. This
     * does not include "error" responses that would be equivalent to 4xx responses.
     */
    REQUEST_COUNT
}