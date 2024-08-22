package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
)

// Details for setting up Contributor Insight rules.
type IContributorInsightRuleDetails interface {
	// The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.
	AvailabilityZoneIdJsonPath() *string
	// The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.
	FaultMetricJsonPath() *string
	// The JSON path to the instance id field in the log files, only required for server-side rules.
	InstanceIdJsonPath() *string
	// The log groups where CloudWatch logs for the operation are located.
	//
	// If
	// this is not provided, Contributor Insight rules cannot be created.
	LogGroups() *[]awslogs.ILogGroup
	// The path in the log files to the field that identifies the operation the log file is for.
	OperationNameJsonPath() *string
	// The path in the log files to the field that indicates the latency for the response.
	//
	// This could either be success latency or fault
	// latency depending on the alarms and rules you are creating.
	SuccessLatencyMetricJsonPath() *string
}

// The jsii proxy for IContributorInsightRuleDetails
type jsiiProxy_IContributorInsightRuleDetails struct {
	_ byte // padding
}

func (j *jsiiProxy_IContributorInsightRuleDetails) AvailabilityZoneIdJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"availabilityZoneIdJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IContributorInsightRuleDetails) FaultMetricJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"faultMetricJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IContributorInsightRuleDetails) InstanceIdJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"instanceIdJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IContributorInsightRuleDetails) LogGroups() *[]awslogs.ILogGroup {
	var returns *[]awslogs.ILogGroup
	_jsii_.Get(
		j,
		"logGroups",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IContributorInsightRuleDetails) OperationNameJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"operationNameJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IContributorInsightRuleDetails) SuccessLatencyMetricJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"successLatencyMetricJsonPath",
		&returns,
	)
	return returns
}

