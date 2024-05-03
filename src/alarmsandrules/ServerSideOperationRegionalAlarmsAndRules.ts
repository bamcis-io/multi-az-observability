import { CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { IServerSideOperationRegionalAlarmsAndRulesProps } from "./props/IServerSideOperationRegionalAlarmsAndRulesProps";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";

/**
 * The server side regional alarms and rules for an operation
 */
export class ServerSideOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules implements IServerSideOperationRegionalAlarmsAndRules
{
    /**
     * A rule that shows which instances are contributing to high latency responses
     */
    instanceContributorsToRegionalHighLatency?: CfnInsightRule;

    /**
     * A rule that shows which instances are contributing to faults
     */
    instanceContributorsToRegionalFaults?: CfnInsightRule;

    constructor(scope: Construct, id: string, props: IServerSideOperationRegionalAlarmsAndRulesProps)
    {
        super(scope, id, props);

        if (props.contributorInsightRuleDetails !== undefined && props.contributorInsightRuleDetails != null)
        {
            this.instanceContributorsToRegionalFaults = AvailabilityAndLatencyAlarmsAndRules.createRegionalInstanceContributorsToFaults(this, props.availabilityMetricDetails, props.contributorInsightRuleDetails);
            this.instanceContributorsToRegionalHighLatency = AvailabilityAndLatencyAlarmsAndRules.createRegionalInstanceContributorsToHighLatency(this, props.latencyMetricDetails, props.contributorInsightRuleDetails);
        }
    }
}