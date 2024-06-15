import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';

export interface IChiSquaredFunction
{
  /**
     * The chi-squared function
     */
  function: IFunction;

  /**
     * The log group where the function logs will be sent
     */
  logGroup: ILogGroup;
}