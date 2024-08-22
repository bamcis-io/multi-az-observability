package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/bamcis-io/multi-az-observability/multi-az-observability/internal"
)

// An service that implements its own instrumentation to record availability and latency metrics that can be used to create alarms, rules, and dashboards from.
type InstrumentedServiceMultiAZObservability interface {
	constructs.Construct
	IInstrumentedServiceMultiAZObservability
	// If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored.
	// Default: - No log group is created if the canary is not requested.
	//
	CanaryLogGroup() awslogs.ILogGroup
	// The tree node.
	Node() constructs.Node
	// The dashboards for each operation.
	OperationDashboards() *[]awscloudwatch.Dashboard
	// Index into the dictionary by operation name, then by Availability Zone Id to get the alarms that indicate an AZ shows isolated impact from availability or latency as seen by either the server-side or canary.
	//
	// These are the alarms
	// you would want to use to trigger automation to evacuate an AZ.
	PerOperationZonalImpactAlarms() *map[string]*map[string]awscloudwatch.IAlarm
	// The alarms and rules for the overall service.
	ServiceAlarms() IServiceAlarmsAndRules
	// The service level dashboard.
	ServiceDashboard() awscloudwatch.Dashboard
	// Returns a string representation of this construct.
	ToString() *string
}

// The jsii proxy struct for InstrumentedServiceMultiAZObservability
type jsiiProxy_InstrumentedServiceMultiAZObservability struct {
	internal.Type__constructsConstruct
	jsiiProxy_IInstrumentedServiceMultiAZObservability
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) CanaryLogGroup() awslogs.ILogGroup {
	var returns awslogs.ILogGroup
	_jsii_.Get(
		j,
		"canaryLogGroup",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) Node() constructs.Node {
	var returns constructs.Node
	_jsii_.Get(
		j,
		"node",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) OperationDashboards() *[]awscloudwatch.Dashboard {
	var returns *[]awscloudwatch.Dashboard
	_jsii_.Get(
		j,
		"operationDashboards",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) PerOperationZonalImpactAlarms() *map[string]*map[string]awscloudwatch.IAlarm {
	var returns *map[string]*map[string]awscloudwatch.IAlarm
	_jsii_.Get(
		j,
		"perOperationZonalImpactAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) ServiceAlarms() IServiceAlarmsAndRules {
	var returns IServiceAlarmsAndRules
	_jsii_.Get(
		j,
		"serviceAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_InstrumentedServiceMultiAZObservability) ServiceDashboard() awscloudwatch.Dashboard {
	var returns awscloudwatch.Dashboard
	_jsii_.Get(
		j,
		"serviceDashboard",
		&returns,
	)
	return returns
}


func NewInstrumentedServiceMultiAZObservability(scope constructs.Construct, id *string, props *InstrumentedServiceMultiAZObservabilityProps) InstrumentedServiceMultiAZObservability {
	_init_.Initialize()

	if err := validateNewInstrumentedServiceMultiAZObservabilityParameters(scope, id, props); err != nil {
		panic(err)
	}
	j := jsiiProxy_InstrumentedServiceMultiAZObservability{}

	_jsii_.Create(
		"multi-az-observability.InstrumentedServiceMultiAZObservability",
		[]interface{}{scope, id, props},
		&j,
	)

	return &j
}

func NewInstrumentedServiceMultiAZObservability_Override(i InstrumentedServiceMultiAZObservability, scope constructs.Construct, id *string, props *InstrumentedServiceMultiAZObservabilityProps) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.InstrumentedServiceMultiAZObservability",
		[]interface{}{scope, id, props},
		i,
	)
}

// Checks if `x` is a construct.
//
// Returns: true if `x` is an object created from a class which extends `Construct`.
// Deprecated: use `x instanceof Construct` instead.
func InstrumentedServiceMultiAZObservability_IsConstruct(x interface{}) *bool {
	_init_.Initialize()

	if err := validateInstrumentedServiceMultiAZObservability_IsConstructParameters(x); err != nil {
		panic(err)
	}
	var returns *bool

	_jsii_.StaticInvoke(
		"multi-az-observability.InstrumentedServiceMultiAZObservability",
		"isConstruct",
		[]interface{}{x},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_InstrumentedServiceMultiAZObservability) ToString() *string {
	var returns *string

	_jsii_.Invoke(
		i,
		"toString",
		nil, // no parameters
		&returns,
	)

	return returns
}

