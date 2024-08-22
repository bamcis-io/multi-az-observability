package multi-az-observability

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
)

// The contributor insight rule details properties.
type ContributorInsightRuleDetailsProps struct {
	// The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.
	AvailabilityZoneIdJsonPath *string `field:"required" json:"availabilityZoneIdJsonPath" yaml:"availabilityZoneIdJsonPath"`
	// The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.
	FaultMetricJsonPath *string `field:"required" json:"faultMetricJsonPath" yaml:"faultMetricJsonPath"`
	// The JSON path to the instance id field in the log files, only required for server-side rules.
	InstanceIdJsonPath *string `field:"required" json:"instanceIdJsonPath" yaml:"instanceIdJsonPath"`
	// The log groups where CloudWatch logs for the operation are located.
	//
	// If
	// this is not provided, Contributor Insight rules cannot be created.
	LogGroups *[]awslogs.ILogGroup `field:"required" json:"logGroups" yaml:"logGroups"`
	// The path in the log files to the field that identifies the operation the log file is for.
	OperationNameJsonPath *string `field:"required" json:"operationNameJsonPath" yaml:"operationNameJsonPath"`
	// The path in the log files to the field that indicates the latency for the response.
	//
	// This could either be success latency or fault
	// latency depending on the alarms and rules you are creating.
	SuccessLatencyMetricJsonPath *string `field:"required" json:"successLatencyMetricJsonPath" yaml:"successLatencyMetricJsonPath"`
}

