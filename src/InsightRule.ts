export class InsightRule
{
    /**
     * The value of Schema for a rule that analyzes CloudWatch Logs data must always be {"Name": "CloudWatchLogRule", "Version": 1}
     */
    schema: RuleSchema;

    /**
     * An array of strings. For each element in the array, you can optionally use * at the end of a string to include all log groups with names that start with that prefix. 
     */
    logGroupNames: string[];

    /**
     * Valid values are JSON and CLF.
     */
    logFormat: string;

    /**
     * Valid values are Count and Sum. Specifies whether to aggregate the report based on a count of occurrences or a sum of the values of the field that is specified in the ValueOf field. 
     */
    aggregateOn: string;

    /**
     * This object includes a Keys array with as many as four members, optionally a single ValueOf, and optionally an array of as many as four Filters. 
     */
    contribution: ContributionDefinition;

    /**
     * Converts the rule to a JSON string
     * @returns 
     */
    ToJson(): string
    {
        return JSON.stringify(this);
    }
}

export class RuleSchema
{
    /**
     * The name of the rule schema, this should bre CloudWatchLogRule
     */
    readonly name: string = "CloudWatchLogRule";

    /**
     * The version number of the schema, this should be 1
     */
    readonly version: number = 1;
}

export class ContributionDefinition
{
    /**
     * An array of up to four log fields that are used as dimensions to classify contributors. 
     * If you enter more than one key, each unique combination of values for the keys is counted 
     * as a unique contributor. The fields must be specified using JSON property format notation. 
     */
    keys: string[]; 
    
    /**
     * (Optional) Specify this only when you are specifying Sum as the value of AggregateOn. 
     * ValueOf specifies a log field with numerical values. In this type of rule, the contributors 
     * are ranked by their sum of the value of this field, instead of their number of occurrences 
     * in the log entries. For example, if you want to sort contributors by their total BytesSent 
     * over a period, you would set ValueOf to BytesSent and specify Sum for AggregateOn. If this
     * value is not set, it must not be included in the JSON string representation of the rule body.
     */
    valueOf: string;

    /**
     * (Optional) Specifies an array of as many as four filters to narrow the log events 
     * that are included in the report. If you specify multiple filters, Contributor Insights 
     * evaluates them with a logical AND operator. You can use this to filter out irrelevant 
     * log events in your search or you can use it to select a single contributor to analyze their behavior.
     */
    filters: {[key: string]: [value: any]}[] = [];

}