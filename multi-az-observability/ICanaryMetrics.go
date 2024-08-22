package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
)

// The metric definitions for metric produced by the canary.
type ICanaryMetrics interface {
	// The canary availability metric details.
	CanaryAvailabilityMetricDetails() IOperationMetricDetails
	// The canary latency metric details.
	CanaryLatencyMetricDetails() IOperationMetricDetails
}

// The jsii proxy for ICanaryMetrics
type jsiiProxy_ICanaryMetrics struct {
	_ byte // padding
}

func (j *jsiiProxy_ICanaryMetrics) CanaryAvailabilityMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"canaryAvailabilityMetricDetails",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ICanaryMetrics) CanaryLatencyMetricDetails() IOperationMetricDetails {
	var returns IOperationMetricDetails
	_jsii_.Get(
		j,
		"canaryLatencyMetricDetails",
		&returns,
	)
	return returns
}

