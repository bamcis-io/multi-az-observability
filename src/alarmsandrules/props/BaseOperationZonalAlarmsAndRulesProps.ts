import { IBaseOperationZonalAlarmsAndRulesProps } from "./IBaseOperationZonalAlarmsAndRulesProps";
import { IContributorInsightRuleDetails } from "../IContributorInsightRuleDetails";
import { IOperationMetricDetails } from "../../IOperationMetricDetails";
import { OutlierDetectionAlgorithm } from "../../utilities/OutlierDetectionAlgorithm";

/**
 * Base properties for zonal alarms and rules
 */
export abstract class BaseOperationZonalAlarmsAndRulesProps implements IBaseOperationZonalAlarmsAndRulesProps
{
    /**
     * The availability metric details
     */
    availabilityMetricDetails: IOperationMetricDetails;

    /**
     * The latency metric details
     */
    latencyMetricDetails: IOperationMetricDetails;

    /**
     * (Optional) A suffix to add to alarm and rule names
     */
    nameSuffix: string;

    /**
     * The Availability Zone Id for the rules and alarms
     */
    availabilityZoneId: string;

    /**
     * A counter to make AZ rules and alarms unique
     */
    counter: number;

    /**
     * (Optional) Details for creating contributor insight rules, which help
     * make the server-side alarms for detecting single AZ failures more accurate
     */
    contributorInsightRuleDetails: IContributorInsightRuleDetails;

    /**
     * The outlier detection algorithm used to determine if Availability Zones
     * or instances are outliers for latency or availability impact. Currently this property
     * is ignored and only STATIC is used.
     */
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm;

     /**
     * Used when the OutlierDetectionAlgorithm is set to STATIC, should be a
     * number between 0 and 1, non-inclusive, representing the percentage
     * or faults or high latency responses that an AZ must have to be considered
     * an outlier.
     */
    outlierThreshold: number;
}