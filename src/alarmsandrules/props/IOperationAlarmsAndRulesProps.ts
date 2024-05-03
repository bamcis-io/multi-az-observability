import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IContributorInsightRuleDetails } from "../IContributorInsightRuleDetails";
import { OutlierDetectionAlgorithm } from "../../utilities/OutlierDetectionAlgorithm";
import { IOperation } from "../../services/IOperation";

/**
 * The properties for the operation alarms and rules
 */
export interface IOperationAlarmsAndRulesProps
{
    /**
     * The operation the alarms and rules are for
     */
    operation: IOperation;

    /**
     * The load balancer associated with this operation. If not provided, its
     * ARN will not be included in top level alarm descriptions
     */
    loadBalancer: ILoadBalancerV2;

    /**
     * Rule details for contributor insight rules
     */
    contributorInsightRuleDetails?: IContributorInsightRuleDetails;

    /**
     * The outlier threshold used with the STATIC outlier detection algorithm
     */
    outlierThreshold: number;

    /**
     * The outlier detection algorithm, currently only STATIC is supported
     */
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm;
}