package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
)

// Represents an operation in a service.
type IOperation interface {
	// Optional metric details if the service has an existing canary.
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

// The jsii proxy for IOperation
type jsiiProxy_IOperation struct {
	_ byte // padding
}

func (j *jsiiProxy_IOperation) CanaryMetricDetails() ICanaryMetrics {
	var returns ICanaryMetrics
	_jsii_.Get(
		j,
		"canaryMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) CanaryTestAvailabilityMetricsOverride() ICanaryTestMetricsOverride {
	var returns ICanaryTestMetricsOverride
	_jsii_.Get(
		j,
		"canaryTestAvailabilityMetricsOverride",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) CanaryTestLatencyMetricsOverride() ICanaryTestMetricsOverride {
	var returns ICanaryTestMetricsOverride
	_jsii_.Get(
		j,
		"canaryTestLatencyMetricsOverride",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) CanaryTestProps() *AddCanaryTestProps {
	var returns *AddCanaryTestProps
	_jsii_.Get(
		j,
		"canaryTestProps",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) Critical() *bool {
	var returns *bool
	_jsii_.Get(
		j,
		"critical",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) HttpMethods() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"httpMethods",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) OperationName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"operationName",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) OptOutOfServiceCreatedCanary() *bool {
	var returns *bool
	_jsii_.Get(
		j,
		"optOutOfServiceCreatedCanary",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) Path() *string {
	var returns *string
	_jsii_.Get(
		j,
		"path",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) ServerSideAvailabilityMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"serverSideAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) ServerSideContributorInsightRuleDetails() IContributorInsightRuleDetails {
	var returns IContributorInsightRuleDetails
	_jsii_.Get(
		j,
		"serverSideContributorInsightRuleDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) ServerSideLatencyMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"serverSideLatencyMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IOperation) Service() IService {
	var returns IService
	_jsii_.Get(
		j,
		"service",
		&returns,
	)
	return returns
}

