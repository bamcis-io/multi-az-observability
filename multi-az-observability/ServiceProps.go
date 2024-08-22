package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awselasticloadbalancingv2"
)

// Properties to initialize a service.
type ServiceProps struct {
	// A list of the Availability Zone names used by this application.
	AvailabilityZoneNames *[]*string `field:"required" json:"availabilityZoneNames" yaml:"availabilityZoneNames"`
	// The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
	BaseUrl *string `field:"required" json:"baseUrl" yaml:"baseUrl"`
	// The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.
	DefaultAvailabilityMetricDetails IServiceMetricDetails `field:"required" json:"defaultAvailabilityMetricDetails" yaml:"defaultAvailabilityMetricDetails"`
	// The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.
	DefaultLatencyMetricDetails IServiceMetricDetails `field:"required" json:"defaultLatencyMetricDetails" yaml:"defaultLatencyMetricDetails"`
	// The fault count threshold that indicates the service is unhealthy.
	//
	// This is an absolute value of faults
	// being produced by all critical operations in aggregate.
	FaultCountThreshold *float64 `field:"required" json:"faultCountThreshold" yaml:"faultCountThreshold"`
	// The period for which metrics for the service should be aggregated.
	Period awscdk.Duration `field:"required" json:"period" yaml:"period"`
	// The name of your service.
	ServiceName *string `field:"required" json:"serviceName" yaml:"serviceName"`
	// Define these settings if you want to automatically add canary tests to your operations.
	//
	// Operations can individually opt out
	// of canary test creation if you define this setting.
	// Default: - Automatic canary tests will not be created for
	// operations in this service.
	//
	CanaryTestProps *AddCanaryTestProps `field:"optional" json:"canaryTestProps" yaml:"canaryTestProps"`
	// The default settings that are used for contributor insight rules.
	// Default: - No defaults are provided and must be specified per operation
	// if the operation has logs that can be queried by contributor insights.
	//
	DefaultContributorInsightRuleDetails IContributorInsightRuleDetails `field:"optional" json:"defaultContributorInsightRuleDetails" yaml:"defaultContributorInsightRuleDetails"`
	// The load balancer this service sits behind.
	// Default: - Load balancer metrics won't be shown on dashboards
	// and its ARN won't be included in top level alarm descriptions
	// that automation can use to implement a zonal shift.
	//
	LoadBalancer awselasticloadbalancingv2.ILoadBalancerV2 `field:"optional" json:"loadBalancer" yaml:"loadBalancer"`
}

