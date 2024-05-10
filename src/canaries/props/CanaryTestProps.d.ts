import { IFunction } from "aws-cdk-lib/aws-lambda";
import { AddCanaryTestProps } from "./AddCanaryTestProps";
import { IOperation } from "../../services/IOperation";
/**
 * The props for creating a canary test on a single operation
 */
export interface CanaryTestProps extends AddCanaryTestProps {
    /**
     * The function that will run the canary requests
     */
    readonly function: IFunction;
    /**
     * The operation for the canary test
     */
    readonly operation: IOperation;
}