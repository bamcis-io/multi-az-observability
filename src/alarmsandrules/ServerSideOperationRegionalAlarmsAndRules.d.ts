import { CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { ServerSideOperationRegionalAlarmsAndRulesProps } from "./props/ServerSideOperationRegionalAlarmsAndRulesProps";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";
/**
 * The server side regional alarms and rules for an operation
 */
export declare class ServerSideOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules implements IServerSideOperationRegionalAlarmsAndRules {
    /**
     * A rule that shows which instances are contributing to high latency responses
     */
    instanceContributorsToRegionalHighLatency?: CfnInsightRule;
    /**
     * A rule that shows which instances are contributing to faults
     */
    instanceContributorsToRegionalFaults?: CfnInsightRule;
    constructor(scope: Construct, id: string, props: ServerSideOperationRegionalAlarmsAndRulesProps);
}
