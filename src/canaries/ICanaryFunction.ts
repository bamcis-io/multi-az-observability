import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ILogGroup } from "aws-cdk-lib/aws-logs";

export interface ICanaryFunction
{
    function: IFunction;

    logGroup: ILogGroup;
}