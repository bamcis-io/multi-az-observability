package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"
)

// A single operation that is part of a service.
type Operation interface {
	IOperation
	// Optional metric details if the service has a canary.
	CanaryMetricDetails() ICanaryMetrics
	// The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability.
	CanaryTestAvailabilityMetricsOverride() ICanaryTestMetricsOverride
	// The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency.
	CanaryTestLatencyMetricsOverride() ICanaryTestMetricsOverride
	// If they have been added, the properties for creating new canary tests on this operation.
	CanaryTestProps() *AddCanaryTestProps
	// Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.
	Critical() *bool
	// The http methods supported by the operation.
	HttpMethods() *[]*string
	// The name of the operation.
	OperationName() *string
	// Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation.
	// Default: - The operation is not opted out.
	//
	OptOutOfServiceCreatedCanary() *bool
	// The HTTP path for the operation for canaries to run against, something like "/products/list".
	Path() *string
	// The server side availability metric details.
	ServerSideAvailabilityMetricDetails() IOperationMetricDetails
	// The server side details for contributor insights rules.
	ServerSideContributorInsightRuleDetails() IContributorInsightRuleDetails
	// The server side latency metric details.
	ServerSideLatencyMetricDetails() IOperationMetricDetails
	// The service the operation is associated with.
	Service() IService
}

// The jsii proxy struct for Operation
type jsiiProxy_Operation struct {
	jsiiProxy_IOperation
}

func (j *jsiiProxy_Operation) CanaryMetricDetails() ICanaryMetrics {
	var returns ICanaryMetrics
	_jsii_.Get(
		j,
		"canaryMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) CanaryTestAvailabilityMetricsOverride() ICanaryTestMetricsOverride {
	var returns ICanaryTestMetricsOverride
	_jsii_.Get(
		j,
		"canaryTestAvailabilityMetricsOverride",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) CanaryTestLatencyMetricsOverride() ICanaryTestMetricsOverride {
	var returns ICanaryTestMetricsOverride
	_jsii_.Get(
		j,
		"canaryTestLatencyMetricsOverride",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) CanaryTestProps() *AddCanaryTestProps {
	var returns *AddCanaryTestProps
	_jsii_.Get(
		j,
		"canaryTestProps",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) Critical() *bool {
	var returns *bool
	_jsii_.Get(
		j,
		"critical",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) HttpMethods() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"httpMethods",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) OperationName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"operationName",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) OptOutOfServiceCreatedCanary() *bool {
	var returns *bool
	_jsii_.Get(
		j,
		"optOutOfServiceCreatedCanary",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) Path() *string {
	var returns *string
	_jsii_.Get(
		j,
		"path",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) ServerSideAvailabilityMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"serverSideAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) ServerSideContributorInsightRuleDetails() IContributorInsightRuleDetails {
	var returns IContributorInsightRuleDetails
	_jsii_.Get(
		j,
		"serverSideContributorInsightRuleDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) ServerSideLatencyMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"serverSideLatencyMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_Operation) Service() IService {
	var returns IService
	_jsii_.Get(
		j,
		"service",
		&returns,
	)
	return returns
}


func NewOperation(props *OperationProps) Operation {
	_init_.Initialize()

	if err := validateNewOperationParameters(props); err != nil {
		panic(err)
	}
	j := jsiiProxy_Operation{}

	_jsii_.Create(
		"multi-az-observability.Operation",
		[]interface{}{props},
		&j,
	)

	return &j
}

func NewOperation_Override(o Operation, props *OperationProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.Operation",
		[]interface{}{props},
		o,
	)
}

