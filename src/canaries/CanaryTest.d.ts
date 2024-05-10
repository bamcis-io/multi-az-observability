import { Construct } from "constructs";
import { CanaryTestProps } from "./props/CanaryTestProps";
import { IRule } from "aws-cdk-lib/aws-events";
export declare class CanaryTest extends Construct {
    timedEventRules: {
        [key: string]: IRule;
    };
    metricNamespace: string;
    constructor(scope: Construct, id: string, props: CanaryTestProps);
}
