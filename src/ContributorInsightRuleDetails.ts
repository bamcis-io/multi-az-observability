import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";

export class ContributorInsightRuleDetails implements IContributorInsightRuleDetails
{
    /**
     * The log groups where CloudWatch logs for the operation are located. If 
     * this is not provided, Contributor Insight rules cannot be created.
     */
    logGroups: ILogGroup[];
    /**
     * The path in the log files to the field that indicates the latency
     * for the response. This could either be success latency or fault 
     * latency depending on the alarms and rules you are creating.
     */
    successLatencyMetricJsonPath: string;

    /**
     * The path in the log files to the field that identifies the operation
     * the log file is for.
     */
    operationNameJsonPath: string;

    /**
     * The path in the log files to the field that identifies if the response
     * resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault
     */
    faultMetricJsonPath: string;

    /**
     * The path in the log files to the field that identifies the Availability Zone
     * Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would
     * have a path of $.AZ-ID
     */
    availabilityZoneIdJsonPath: string;

    /**
     * The JSON path to the instance id field in the log files, only required for server-side
     * rules
     */
    instanceIdJsonPath: string;
}