import { Duration } from 'aws-cdk-lib';
import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';

/**
 * Properties for the canary function
 */
export interface CanaryFunctionProps
{
  /**
     * If you want the function to run in your VPC, provide
     * the VPC object
     */
  readonly vpc?: IVpc;

  /**
     * The subnets to use in the VPC
     */
  readonly subnetSelection?: SubnetSelection;

  /**
     * Set to true to ignore TLS certificate errors, default is to
     * not ignore them
     */
  readonly ignoreTlsErrors?: boolean;

  /**
     * Specify the timeout for each http request, the default is
     * 2 seconds
     */
  readonly httpTimeout?: Duration;
}