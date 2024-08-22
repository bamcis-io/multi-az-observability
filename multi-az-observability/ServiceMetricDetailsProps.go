package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
)

// The properties for default service metric details.
type ServiceMetricDetailsProps struct {
	// The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".
	AlarmStatistic *string `field:"required" json:"alarmStatistic" yaml:"alarmStatistic"`
	// The number of datapoints to alarm on for latency and availability alarms.
	DatapointsToAlarm *float64 `field:"required" json:"datapointsToAlarm" yaml:"datapointsToAlarm"`
	// The number of evaluation periods for latency and availabiltiy alarms.
	EvaluationPeriods *float64 `field:"required" json:"evaluationPeriods" yaml:"evaluationPeriods"`
	// The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.
	FaultAlarmThreshold *float64 `field:"required" json:"faultAlarmThreshold" yaml:"faultAlarmThreshold"`
	// The names of fault indicating metrics.
	FaultMetricNames *[]*string `field:"required" json:"faultMetricNames" yaml:"faultMetricNames"`
	// The CloudWatch metric namespace for these metrics.
	MetricNamespace *string `field:"required" json:"metricNamespace" yaml:"metricNamespace"`
	// The period for the metrics.
	Period awscdk.Duration `field:"required" json:"period" yaml:"period"`
	// The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.
	SuccessAlarmThreshold *float64 `field:"required" json:"successAlarmThreshold" yaml:"successAlarmThreshold"`
	// The names of success indicating metrics.
	SuccessMetricNames *[]*string `field:"required" json:"successMetricNames" yaml:"successMetricNames"`
	// The unit used for these metrics.
	Unit awscloudwatch.Unit `field:"required" json:"unit" yaml:"unit"`
	// The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - For availability metrics, this will be "Sum", for latency metrics it will be just "p99".
	//
	GraphedFaultStatistics *[]*string `field:"optional" json:"graphedFaultStatistics" yaml:"graphedFaultStatistics"`
	// The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - For availability metrics, this will be "Sum", for latency metrics it will be just "p99".
	//
	GraphedSuccessStatistics *[]*string `field:"optional" json:"graphedSuccessStatistics" yaml:"graphedSuccessStatistics"`
}

