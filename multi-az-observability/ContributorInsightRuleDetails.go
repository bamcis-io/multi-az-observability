package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
)

// The contributor insight rule details for creating an insight rule.
type ContributorInsightRuleDetails interface {
	IContributorInsightRuleDetails
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

// The jsii proxy struct for ContributorInsightRuleDetails
type jsiiProxy_ContributorInsightRuleDetails struct {
	jsiiProxy_IContributorInsightRuleDetails
}

func (j *jsiiProxy_ContributorInsightRuleDetails) AvailabilityZoneIdJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"availabilityZoneIdJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ContributorInsightRuleDetails) FaultMetricJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"faultMetricJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ContributorInsightRuleDetails) InstanceIdJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"instanceIdJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ContributorInsightRuleDetails) LogGroups() *[]awslogs.ILogGroup {
	var returns *[]awslogs.ILogGroup
	_jsii_.Get(
		j,
		"logGroups",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ContributorInsightRuleDetails) OperationNameJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"operationNameJsonPath",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_ContributorInsightRuleDetails) SuccessLatencyMetricJsonPath() *string {
	var returns *string
	_jsii_.Get(
		j,
		"successLatencyMetricJsonPath",
		&returns,
	)
	return returns
}


func NewContributorInsightRuleDetails(props *ContributorInsightRuleDetailsProps) ContributorInsightRuleDetails {
	_init_.Initialize()

	if err := validateNewContributorInsightRuleDetailsParameters(props); err != nil {
		panic(err)
	}
	j := jsiiProxy_ContributorInsightRuleDetails{}

	_jsii_.Create(
		"multi-az-observability.ContributorInsightRuleDetails",
		[]interface{}{props},
		&j,
	)

	return &j
}

func NewContributorInsightRuleDetails_Override(c ContributorInsightRuleDetails, props *ContributorInsightRuleDetailsProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.ContributorInsightRuleDetails",
		[]interface{}{props},
		c,
	)
}

