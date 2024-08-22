package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awselasticloadbalancingv2"
)

// Represents a complete service composed of one or more operations.
type IService interface {
	// Adds an operation to this service.
	AddOperation(operation IOperation)
	// A list of the Availability Zone names used by this application.
	AvailabilityZoneNames() *[]*string
	// The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
	BaseUrl() *string
	// Define these settings if you want to automatically add canary tests to your operations.
	//
	// Operations can individually opt out
	// of canary test creation if you define this setting.
	// Default: - Automatic canary tests will not be created for
	// operations in this service.
	//
	CanaryTestProps() *AddCanaryTestProps
	// The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.
	DefaultAvailabilityMetricDetails() IServiceMetricDetails
	// The default settings that are used for contributor insight rules.
	// Default: - No defaults are provided and must be specified per operation.
	//
	DefaultContributorInsightRuleDetails() IContributorInsightRuleDetails
	// The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.
	DefaultLatencyMetricDetails() IServiceMetricDetails
	// The fault count threshold that indicates the service is unhealthy.
	//
	// This is an absolute value of faults
	// being produced by all critical operations in aggregate.
	FaultCountThreshold() *float64
	// The load balancer this service sits behind.
	// Default: - No load balancer metrics are included in
	// dashboards and its ARN is not added to top level AZ
	// alarm descriptions.
	//
	LoadBalancer() awselasticloadbalancingv2.ILoadBalancerV2
	// The operations that are part of this service.
	Operations() *[]IOperation
	// The period for which metrics for the service should be aggregated.
	Period() awscdk.Duration
	// The name of your service.
	ServiceName() *string
}

// The jsii proxy for IService
type jsiiProxy_IService struct {
	_ byte // padding
}

func (i *jsiiProxy_IService) AddOperation(operation IOperation) {
	if err := i.validateAddOperationParameters(operation); err != nil {
		panic(err)
	}
	_jsii_.InvokeVoid(
		i,
		"addOperation",
		[]interface{}{operation},
	)
}

func (j *jsiiProxy_IService) AvailabilityZoneNames() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"availabilityZoneNames",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) BaseUrl() *string {
	var returns *string
	_jsii_.Get(
		j,
		"baseUrl",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) CanaryTestProps() *AddCanaryTestProps {
	var returns *AddCanaryTestProps
	_jsii_.Get(
		j,
		"canaryTestProps",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) DefaultAvailabilityMetricDetails() IServiceMetricDetails {
	var returns IServiceMetricDetails
	_jsii_.Get(
		j,
		"defaultAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) DefaultContributorInsightRuleDetails() IContributorInsightRuleDetails {
	var returns IContributorInsightRuleDetails
	_jsii_.Get(
		j,
		"defaultContributorInsightRuleDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) DefaultLatencyMetricDetails() IServiceMetricDetails {
	var returns IServiceMetricDetails
	_jsii_.Get(
		j,
		"defaultLatencyMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) FaultCountThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"faultCountThreshold",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) LoadBalancer() awselasticloadbalancingv2.ILoadBalancerV2 {
	var returns awselasticloadbalancingv2.ILoadBalancerV2
	_jsii_.Get(
		j,
		"loadBalancer",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) Operations() *[]IOperation {
	var returns *[]IOperation
	_jsii_.Get(
		j,
		"operations",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) Period() awscdk.Duration {
	var returns awscdk.Duration
	_jsii_.Get(
		j,
		"period",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IService) ServiceName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"serviceName",
		&returns,
	)
	return returns
}

