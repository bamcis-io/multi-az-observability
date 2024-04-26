import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { OutlierDetectionAlgorithm } from "./OutlierDetectionAlgorithm";
import { CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";

/**
 * The base properties for an operation zonal alarms and rules configuration
 */
export interface IBaseOperationZonalAlarmsAndRulesProps
{
    /**
     * The availability metric details to create alarms and rules from
     */
    availabilityMetricDetails: IOperationMetricDetails;

    /**
     * The latency metric details to create alarms and rules from
     */
    latencyMetricDetails: IOperationMetricDetails;

    /**
     * The Availability Zone Id the alarms and rules are being created for
     */
    availabilityZoneId: string

    /**
     * A counter used to name the CDK constructs uniquely
     */
    counter: number

    /**
     * Used when the OutlierDetectionAlgorithm is set to STATIC, should be a
     * number between 0 and 1, non-inclusive, representing the percentage
     * or faults or high latency responses that an AZ must have to be considered
     * an outlier.
     */
    outlierThreshold: number;

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
     * (Optional) A suffix to apply to alarm and rules names, like "-server" for server
     * side metrics and alarms
     */
    nameSuffix: string;
}