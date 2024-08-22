package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
)

// The network configuration for the canary function.
type NetworkConfigurationProps struct {
	// The subnets the Lambda function will be deployed in the VPC.
	SubnetSelection *awsec2.SubnetSelection `field:"required" json:"subnetSelection" yaml:"subnetSelection"`
	// The VPC to run the canary in.
	//
	// A security group will be created
	// that allows the function to communicate with the VPC as well
	// as the required IAM permissions.
	Vpc awsec2.IVpc `field:"required" json:"vpc" yaml:"vpc"`
}

