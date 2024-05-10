import { Construct } from "constructs";
import { CanaryFunctionProps } from "./props/CanaryFunctionProps";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { ICanaryFunction } from "./ICanaryFunction";
export declare class CanaryFunction extends Construct implements ICanaryFunction {
    /**
     * The canary function
     */
    function: IFunction;
    /**
     * The log group where the canarty logs will be sent
     */
    logGroup: ILogGroup;
    constructor(scope: Construct, id: string, props: CanaryFunctionProps);
}
