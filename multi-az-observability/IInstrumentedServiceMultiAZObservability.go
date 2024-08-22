package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/bamcis-io/multi-az-observability/multi-az-observability/internal"
)

// Observability for an instrumented service.
type IInstrumentedServiceMultiAZObservability interface {
	constructs.IConstruct
	// If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored.
	// Default: - No log group is created if the canary is not requested.
	//
	CanaryLogGroup() awslogs.ILogGroup
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
}

// The jsii proxy for IInstrumentedServiceMultiAZObservability
type jsiiProxy_IInstrumentedServiceMultiAZObservability struct {
	internal.Type__constructsIConstruct
}

func (j *jsiiProxy_IInstrumentedServiceMultiAZObservability) CanaryLogGroup() awslogs.ILogGroup {
	var returns awslogs.ILogGroup
	_jsii_.Get(
		j,
		"canaryLogGroup",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IInstrumentedServiceMultiAZObservability) OperationDashboards() *[]awscloudwatch.Dashboard {
	var returns *[]awscloudwatch.Dashboard
	_jsii_.Get(
		j,
		"operationDashboards",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IInstrumentedServiceMultiAZObservability) PerOperationZonalImpactAlarms() *map[string]*map[string]awscloudwatch.IAlarm {
	var returns *map[string]*map[string]awscloudwatch.IAlarm
	_jsii_.Get(
		j,
		"perOperationZonalImpactAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IInstrumentedServiceMultiAZObservability) ServiceAlarms() IServiceAlarmsAndRules {
	var returns IServiceAlarmsAndRules
	_jsii_.Get(
		j,
		"serviceAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IInstrumentedServiceMultiAZObservability) ServiceDashboard() awscloudwatch.Dashboard {
	var returns awscloudwatch.Dashboard
	_jsii_.Get(
		j,
		"serviceDashboard",
		&returns,
	)
	return returns
}

