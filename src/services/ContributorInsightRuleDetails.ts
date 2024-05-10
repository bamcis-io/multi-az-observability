import { ILogGroup } from 'aws-cdk-lib/aws-logs';
import { IContributorInsightRuleDetails } from './IContributorInsightRuleDetails';
import { ContributorInsightRuleDetailsProps } from './props/ContributorInsightRuleDetailsProps';

/**
 * The contributor insight rule details for creating an
 * insight rule
 */
export class ContributorInsightRuleDetails implements IContributorInsightRuleDetails {
  /**
     * The log groups where CloudWatch logs for the operation are located. If
     * this is not provided, Contributor Insight rules cannot be created.
     */
  readonly logGroups: ILogGroup[];

  /**
     * The path in the log files to the field that indicates the latency
     * for the response. This could either be success latency or fault
     * latency depending on the alarms and rules you are creating.
     */
  readonly successLatencyMetricJsonPath: string;

  /**
     * The path in the log files to the field that identifies the operation
     * the log file is for.
     */
  readonly operationNameJsonPath: string;

  /**
     * The path in the log files to the field that identifies if the response
     * resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault
     */
  readonly faultMetricJsonPath: string;

  /**
     * The path in the log files to the field that identifies the Availability Zone
     * Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would
     * have a path of $.AZ-ID
     */
  readonly availabilityZoneIdJsonPath: string;

  /**
     * The JSON path to the instance id field in the log files, only required for server-side
     * rules
     */
  readonly instanceIdJsonPath: string;

  constructor(props: ContributorInsightRuleDetailsProps) {
    this.availabilityZoneIdJsonPath = props.availabilityZoneIdJsonPath;
    this.faultMetricJsonPath = props.faultMetricJsonPath;
    this.instanceIdJsonPath = props.instanceIdJsonPath;
    this.logGroups = props.logGroups;
    this.operationNameJsonPath = props.operationNameJsonPath;
    this.successLatencyMetricJsonPath = props.successLatencyMetricJsonPath;
  }
}