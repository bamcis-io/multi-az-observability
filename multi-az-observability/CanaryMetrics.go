package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"
)

// Represents metrics for a canary testing a service.
type CanaryMetrics interface {
	ICanaryMetrics
	// The canary availability metric details.
	CanaryAvailabilityMetricDetails() IOperationMetricDetails
	// The canary latency metric details.
	CanaryLatencyMetricDetails() IOperationMetricDetails
}

// The jsii proxy struct for CanaryMetrics
type jsiiProxy_CanaryMetrics struct {
	jsiiProxy_ICanaryMetrics
}

func (j *jsiiProxy_CanaryMetrics) CanaryAvailabilityMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"canaryAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryMetrics) CanaryLatencyMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"canaryLatencyMetricDetails",
		&returns,
	)
	return returns
}


func NewCanaryMetrics(props *CanaryMetricProps) CanaryMetrics {
	_init_.Initialize()

	if err := validateNewCanaryMetricsParameters(props); err != nil {
		panic(err)
	}
	j := jsiiProxy_CanaryMetrics{}

	_jsii_.Create(
		"multi-az-observability.CanaryMetrics",
		[]interface{}{props},
		&j,
	)

	return &j
}

func NewCanaryMetrics_Override(c CanaryMetrics, props *CanaryMetricProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.CanaryMetrics",
		[]interface{}{props},
		c,
	)
}

