package multi-az-observability


// Properties for canary metrics in an operation.
type CanaryMetricProps struct {
	// The canary availability metric details.
	CanaryAvailabilityMetricDetails IOperationMetricDetails `field:"required" json:"canaryAvailabilityMetricDetails" yaml:"canaryAvailabilityMetricDetails"`
	// The canary latency metric details.
	CanaryLatencyMetricDetails IOperationMetricDetails `field:"required" json:"canaryLatencyMetricDetails" yaml:"canaryLatencyMetricDetails"`
}

