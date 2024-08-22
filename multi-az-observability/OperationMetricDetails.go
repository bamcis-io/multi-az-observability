package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
)

// Generic metric details for an operation.
type OperationMetricDetails interface {
	IOperationMetricDetails
	// The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".
	AlarmStatistic() *string
	// The number of datapoints to alarm on for latency and availability alarms.
	DatapointsToAlarm() *float64
	// The number of evaluation periods for latency and availabiltiy alarms.
	EvaluationPeriods() *float64
	// The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.
	FaultAlarmThreshold() *float64
	// The names of fault indicating metrics.
	FaultMetricNames() *[]*string
	// The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - For availability metrics, this will be "Sum", for latency metrics it will be just "p99".
	//
	GraphedFaultStatistics() *[]*string
	// The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - For availability metrics, this will be "Sum", for latency metrics it will be just "p99".
	//
	GraphedSuccessStatistics() *[]*string
	// The metric dimensions for this operation, must be implemented as a concrete class by the user.
	MetricDimensions() MetricDimensions
	// The CloudWatch metric namespace for these metrics.
	MetricNamespace() *string
	// The operation these metric details are for.
	OperationName() *string
	// The period for the metrics.
	Period() awscdk.Duration
	// The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.
	SuccessAlarmThreshold() *float64
	// The names of success indicating metrics.
	SuccessMetricNames() *[]*string
	// The unit used for these metrics.
	Unit() awscloudwatch.Unit
}

// The jsii proxy struct for OperationMetricDetails
type jsiiProxy_OperationMetricDetails struct {
	jsiiProxy_IOperationMetricDetails
}

func (j *jsiiProxy_OperationMetricDetails) AlarmStatistic() *string {
	var returns *string
	_jsii_.Get(
		j,
		"alarmStatistic",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) DatapointsToAlarm() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"datapointsToAlarm",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) EvaluationPeriods() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"evaluationPeriods",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) FaultAlarmThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"faultAlarmThreshold",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) FaultMetricNames() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"faultMetricNames",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) GraphedFaultStatistics() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"graphedFaultStatistics",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) GraphedSuccessStatistics() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"graphedSuccessStatistics",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) MetricDimensions() MetricDimensions {
	var returns MetricDimensions
	_jsii_.Get(
		j,
		"metricDimensions",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) MetricNamespace() *string {
	var returns *string
	_jsii_.Get(
		j,
		"metricNamespace",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) OperationName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"operationName",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) Period() awscdk.Duration {
	var returns awscdk.Duration
	_jsii_.Get(
		j,
		"period",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) SuccessAlarmThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"successAlarmThreshold",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) SuccessMetricNames() *[]*string {
	var returns *[]*string
	_jsii_.Get(
		j,
		"successMetricNames",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_OperationMetricDetails) Unit() awscloudwatch.Unit {
	var returns awscloudwatch.Unit
	_jsii_.Get(
		j,
		"unit",
		&returns,
	)
	return returns
}


func NewOperationMetricDetails(props *OperationMetricDetailsProps, defaultProps IServiceMetricDetails) OperationMetricDetails {
	_init_.Initialize()

	if err := validateNewOperationMetricDetailsParameters(props, defaultProps); err != nil {
		panic(err)
	}
	j := jsiiProxy_OperationMetricDetails{}

	_jsii_.Create(
		"multi-az-observability.OperationMetricDetails",
		[]interface{}{props, defaultProps},
		&j,
	)

	return &j
}

func NewOperationMetricDetails_Override(o OperationMetricDetails, props *OperationMetricDetailsProps, defaultProps IServiceMetricDetails) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.OperationMetricDetails",
		[]interface{}{props, defaultProps},
		o,
	)
}

