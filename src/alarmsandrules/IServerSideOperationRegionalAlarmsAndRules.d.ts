import { CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { IBaseOperationRegionalAlarmsAndRules } from "./IBaseOperationRegionalAlarmsAndRules";
/**
 * The server side operation regional alarms and rules
 */
export interface IServerSideOperationRegionalAlarmsAndRules extends IBaseOperationRegionalAlarmsAndRules {
    /**
    * A rule that shows which instances are contributing to high latency responses
    */
    instanceContributorsToRegionalHighLatency?: CfnInsightRule;
    /**
     * A rule that shows which instances are contributing to faults
     */
    instanceContributorsToRegionalFaults?: CfnInsightRule;
}
