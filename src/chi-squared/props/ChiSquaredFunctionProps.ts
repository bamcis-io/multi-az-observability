import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';

export interface ChiSquaredFunctionProps
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
}