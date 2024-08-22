package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awselasticloadbalancingv2"
)

// The representation of a service composed of multiple operations.
type Service interface {
	IService
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
	// Default: - No load balancer metrics will be included in
	// dashboards and its ARN will not be added to top level AZ
	// alarm descriptions.
	//
	LoadBalancer() awselasticloadbalancingv2.ILoadBalancerV2
	// The operations that are part of this service.
	Operations() *[]IOperation
	// The period for which metrics for the service should be aggregated.
	Period() awscdk.Duration
	// The name of your service.
	ServiceName() *string
	// Adds an operation to this service and sets the operation's service property.
	AddOperation(operation IOperation)
}

// The jsii proxy struct for Service
type jsiiProxy_Service struct {
	jsiiProxy_IService
}

func (j *jsiiProxy_Service) AvailabilityZoneNames() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"availabilityZoneNames",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) BaseUrl() *string {
	var returns *string
	_jsii_.Get(
		j,
		"baseUrl",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) CanaryTestProps() *AddCanaryTestProps {
	var returns *AddCanaryTestProps
	_jsii_.Get(
		j,
		"canaryTestProps",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) DefaultAvailabilityMetricDetails() IServiceMetricDetails {
	var returns IServiceMetricDetails
	_jsii_.Get(
		j,
		"defaultAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) DefaultContributorInsightRuleDetails() IContributorInsightRuleDetails {
	var returns IContributorInsightRuleDetails
	_jsii_.Get(
		j,
		"defaultContributorInsightRuleDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) DefaultLatencyMetricDetails() IServiceMetricDetails {
	var returns IServiceMetricDetails
	_jsii_.Get(
		j,
		"defaultLatencyMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) FaultCountThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"faultCountThreshold",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) LoadBalancer() awselasticloadbalancingv2.ILoadBalancerV2 {
	var returns awselasticloadbalancingv2.ILoadBalancerV2
	_jsii_.Get(
		j,
		"loadBalancer",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) Operations() *[]IOperation {
	var returns *[]IOperation
	_jsii_.Get(
		j,
		"operations",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) Period() awscdk.Duration {
	var returns awscdk.Duration
	_jsii_.Get(
		j,
		"period",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Service) ServiceName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"serviceName",
		&returns,
	)
	return returns
}


func NewService(props *ServiceProps) Service {
	_init_.Initialize()

	if err := validateNewServiceParameters(props); err != nil {
		panic(err)
	}
	j := jsiiProxy_Service{}

	_jsii_.Create(
		"multi-az-observability.Service",
		[]interface{}{props},
		&j,
	)

	return &j
}

func NewService_Override(s Service, props *ServiceProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.Service",
		[]interface{}{props},
		s,
	)
}

func (s *jsiiProxy_Service) AddOperation(operation IOperation) {
	if err := s.validateAddOperationParameters(operation); err != nil {
		panic(err)
	}
	_jsii_.InvokeVoid(
		s,
		"addOperation",
		[]interface{}{operation},
	)
}

