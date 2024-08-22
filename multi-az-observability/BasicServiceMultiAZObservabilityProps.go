package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awselasticloadbalancingv2"
)

// Properties for creating a basic service.
type BasicServiceMultiAZObservabilityProps struct {
	// Whether to create a dashboard displaying the metrics and alarms.
	CreateDashboard *bool `field:"required" json:"createDashboard" yaml:"createDashboard"`
	// The number of datapoints to alarm on for latency and availability alarms.
	DatapointsToAlarm *float64 `field:"required" json:"datapointsToAlarm" yaml:"datapointsToAlarm"`
	// The number of evaluation periods for latency and availabiltiy alarms.
	EvaluationPeriods *float64 `field:"required" json:"evaluationPeriods" yaml:"evaluationPeriods"`
	// The algorithm to use for performing outlier detection.
	OutlierDetectionAlgorithm OutlierDetectionAlgorithm `field:"required" json:"outlierDetectionAlgorithm" yaml:"outlierDetectionAlgorithm"`
	// The period to evaluate metrics.
	Period awscdk.Duration `field:"required" json:"period" yaml:"period"`
	// The service's name.
	ServiceName *string `field:"required" json:"serviceName" yaml:"serviceName"`
	// The application load balancers being used by the service.
	// Default: - No alarms for ALBs will be created.
	//
	ApplicationLoadBalancers *[]awselasticloadbalancingv2.IApplicationLoadBalancer `field:"optional" json:"applicationLoadBalancers" yaml:"applicationLoadBalancers"`
	// If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket whose name is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.
	//
	// It will override the bucket location CDK provides by
	// default for bundled assets. The stack containing this contruct needs
	// to have a parameter defined that uses this name. The underlying
	// stacks in this construct that deploy assets will copy the parent stack's
	// value for this property.
	// Default: - The assets will be uploaded to the default defined
	// asset location.
	//
	AssetsBucketParameterName *string `field:"optional" json:"assetsBucketParameterName" yaml:"assetsBucketParameterName"`
	// If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket that uses a prefix that is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.
	//
	// It will override the bucket prefix CDK provides by
	// default for bundled assets. This property only takes effect if you
	// defined the assetsBucketParameterName. The stack containing this contruct needs
	// to have a parameter defined that uses this name. The underlying
	// stacks in this construct that deploy assets will copy the parent stack's
	// value for this property.
	// Default: - No object prefix will be added to your custom assets location.
	// However, if you have overridden something like the 'BucketPrefix' property
	// in your stack synthesizer with a variable like "${AssetsBucketPrefix",
	// you will need to define this property so it doesn't cause a reference error
	// even if the prefix value is blank.
	//
	AssetsBucketPrefixParameterName *string `field:"optional" json:"assetsBucketPrefixParameterName" yaml:"assetsBucketPrefixParameterName"`
	// The percentage of faults for a single ALB to consider an AZ to be unhealthy, this should align with your availability goal.
	//
	// For example
	// 1% or 5%.
	// Default: - 5 (as in 5%).
	//
	FaultCountPercentageThreshold *float64 `field:"optional" json:"faultCountPercentageThreshold" yaml:"faultCountPercentageThreshold"`
	// Dashboard interval.
	// Default: - 1 hour.
	//
	Interval awscdk.Duration `field:"optional" json:"interval" yaml:"interval"`
	// (Optional) A map of Availability Zone name to the NAT Gateways in that AZ.
	// Default: - No alarms for NAT Gateways will be created.
	//
	NatGateways *map[string]*[]awsec2.CfnNatGateway `field:"optional" json:"natGateways" yaml:"natGateways"`
	// The outlier threshold for determining if an AZ is an outlier for latency or faults.
	//
	// This number is interpreted
	// differently for different outlier algorithms. When used with
	// STATIC, the number should be between 0 and 1 to represent the
	// percentage of errors (like .7) that an AZ must be responsible
	// for to be considered an outlier. When used with CHI_SQUARED, it
	// represents the p value that indicates statistical significance, like
	// 0.05 which means the skew has less than or equal to a 5% chance of
	// occuring. When used with Z_SCORE it indicates how many standard
	// deviations to evaluate for an AZ being an outlier, typically 3 is
	// standard for Z_SCORE.
	//
	// Standard defaults based on the outlier detection algorithm:
	// STATIC: 0.7
	// CHI_SQUARED: 0.05
	// Z_SCORE: 2
	// IQR: 1.5
	// MAD: 3.
	// Default: - Depends on the outlier detection algorithm selected.
	//
	OutlierThreshold *float64 `field:"optional" json:"outlierThreshold" yaml:"outlierThreshold"`
	// The amount of packet loss in a NAT GW to determine if an AZ is actually impacted, recommendation is 0.01%.
	// Default: - 0.01 (as in 0.01%)
	//
	PacketLossImpactPercentageThreshold *float64 `field:"optional" json:"packetLossImpactPercentageThreshold" yaml:"packetLossImpactPercentageThreshold"`
}

