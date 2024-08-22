package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2"
)

// Provides overrides for the default metric settings used for the automatically created canary tests.
type CanaryTestMetricsOverride interface {
	ICanaryTestMetricsOverride
	// The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".
	AlarmStatistic() *string
	// The number of datapoints to alarm on for latency and availability alarms.
	DatapointsToAlarm() *float64
	// The number of evaluation periods for latency and availabiltiy alarms.
	EvaluationPeriods() *float64
	// The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.
	FaultAlarmThreshold() *float64
	// The period for the metrics.
	Period() awscdk.Duration
	// The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.
	SuccessAlarmThreshold() *float64
}

// The jsii proxy struct for CanaryTestMetricsOverride
type jsiiProxy_CanaryTestMetricsOverride struct {
	jsiiProxy_ICanaryTestMetricsOverride
}

func (j *jsiiProxy_CanaryTestMetricsOverride) AlarmStatistic() *string {
	var returns *string
	_jsii_.Get(
		j,
		"alarmStatistic",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryTestMetricsOverride) DatapointsToAlarm() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"datapointsToAlarm",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryTestMetricsOverride) EvaluationPeriods() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"evaluationPeriods",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryTestMetricsOverride) FaultAlarmThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"faultAlarmThreshold",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryTestMetricsOverride) Period() awscdk.Duration {
	var returns awscdk.Duration
	_jsii_.Get(
		j,
		"period",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_CanaryTestMetricsOverride) SuccessAlarmThreshold() *float64 {
	var returns *float64
	_jsii_.Get(
		j,
		"successAlarmThreshold",
		&returns,
	)
	return returns
}


func NewCanaryTestMetricsOverride(props *CanaryTestMetricsOverrideProps) CanaryTestMetricsOverride {
	_init_.Initialize()

	if err := validateNewCanaryTestMetricsOverrideParameters(props); err != nil {
		panic(err)
	}
	j := jsiiProxy_CanaryTestMetricsOverride{}

	_jsii_.Create(
		"multi-az-observability.CanaryTestMetricsOverride",
		[]interface{}{props},
		&j,
	)

	return &j
}

func NewCanaryTestMetricsOverride_Override(c CanaryTestMetricsOverride, props *CanaryTestMetricsOverrideProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.CanaryTestMetricsOverride",
		[]interface{}{props},
		c,
	)
}

