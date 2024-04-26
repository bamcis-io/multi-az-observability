import { IAvailabilityMetricProps } from "./IAvailabilityMetricProps";

/**
 * Metric properties for regional availability metrics
 */
export interface IRegionalAvailabilityMetricProps extends IAvailabilityMetricProps
{
    /**
     * The AWS Region
     */
    region: string;
}