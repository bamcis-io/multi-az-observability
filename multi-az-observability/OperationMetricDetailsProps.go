package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
)

// The properties for operation metric details.
type OperationMetricDetailsProps struct {
	// The user implemented functions for providing the metric's dimensions.
	MetricDimensions MetricDimensions `field:"required" json:"metricDimensions" yaml:"metricDimensions"`
	// The operation these metric details are for.
	OperationName *string `field:"required" json:"operationName" yaml:"operationName"`
	// The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".
	// Default: - The service default is used.
	//
	AlarmStatistic *string `field:"optional" json:"alarmStatistic" yaml:"alarmStatistic"`
	// The number of datapoints to alarm on for latency and availability alarms.
	// Default: - The service default is used.
	//
	DatapointsToAlarm *float64 `field:"optional" json:"datapointsToAlarm" yaml:"datapointsToAlarm"`
	// The number of evaluation periods for latency and availabiltiy alarms.
	// Default: - The service default is used.
	//
	EvaluationPeriods *float64 `field:"optional" json:"evaluationPeriods" yaml:"evaluationPeriods"`
	// The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.
	// Default: - The service default is used.
	//
	FaultAlarmThreshold *float64 `field:"optional" json:"faultAlarmThreshold" yaml:"faultAlarmThreshold"`
	// The names of fault indicating metrics.
	// Default: - The service default is used.
	//
	FaultMetricNames *[]*string `field:"optional" json:"faultMetricNames" yaml:"faultMetricNames"`
	// The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - The service default is used.
	//
	GraphedFaultStatistics *[]*string `field:"optional" json:"graphedFaultStatistics" yaml:"graphedFaultStatistics"`
	// The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.
	//
	// For availability
	// metrics this will typically just be "Sum".
	// Default: - The service default is used.
	//
	GraphedSuccessStatistics *[]*string `field:"optional" json:"graphedSuccessStatistics" yaml:"graphedSuccessStatistics"`
	// The CloudWatch metric namespace for these metrics.
	// Default: - The service default is used.
	//
	MetricNamespace *string `field:"optional" json:"metricNamespace" yaml:"metricNamespace"`
	// The period for the metrics.
	// Default: - The service default is used.
	//
	Period awscdk.Duration `field:"optional" json:"period" yaml:"period"`
	// The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.
	// Default: - The service default is used.
	//
	SuccessAlarmThreshold *float64 `field:"optional" json:"successAlarmThreshold" yaml:"successAlarmThreshold"`
	// The names of success indicating metrics.
	// Default: - The service default is used.
	//
	SuccessMetricNames *[]*string `field:"optional" json:"successMetricNames" yaml:"successMetricNames"`
	// The unit used for these metrics.
	// Default: - The service default is used.
	//
	Unit awscloudwatch.Unit `field:"optional" json:"unit" yaml:"unit"`
}

