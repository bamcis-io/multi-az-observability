package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awselasticloadbalancingv2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/bamcis-io/multi-az-observability/multi-az-observability/internal"
)

// Properties of a basic service.
type IBasicServiceMultiAZObservability interface {
	constructs.IConstruct
	// The alarms indicating if an AZ has isolated impact from either ALB or NAT GW metrics.
	AggregateZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm
	SetAggregateZonalIsolatedImpactAlarms(a *map[string]awscloudwatch.IAlarm)
	// The alarms indicating if an AZ is an outlier for ALB faults and has isolated impact.
	AlbZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm
	SetAlbZonalIsolatedImpactAlarms(a *map[string]awscloudwatch.IAlarm)
	// The application load balancers being used by the service.
	ApplicationLoadBalancers() *[]awselasticloadbalancingv2.IApplicationLoadBalancer
	SetApplicationLoadBalancers(a *[]awselasticloadbalancingv2.IApplicationLoadBalancer)
	// The NAT Gateways being used in the service, each set of NAT Gateways are keyed by their Availability Zone Id.
	NatGateways() *map[string]*[]awsec2.CfnNatGateway
	SetNatGateways(n *map[string]*[]awsec2.CfnNatGateway)
	// The alarms indicating if an AZ is an outlier for NAT GW packet loss and has isolated impact.
	NatGWZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm
	SetNatGWZonalIsolatedImpactAlarms(n *map[string]awscloudwatch.IAlarm)
	// The name of the service.
	ServiceName() *string
	SetServiceName(s *string)
}

// The jsii proxy for IBasicServiceMultiAZObservability
type jsiiProxy_IBasicServiceMultiAZObservability struct {
	internal.Type__constructsIConstruct
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) AggregateZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm {
	var returns *map[string]awscloudwatch.IAlarm
	_jsii_.Get(
		j,
		"aggregateZonalIsolatedImpactAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetAggregateZonalIsolatedImpactAlarms(val *map[string]awscloudwatch.IAlarm) {
	if err := j.validateSetAggregateZonalIsolatedImpactAlarmsParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"aggregateZonalIsolatedImpactAlarms",
		val,
	)
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) AlbZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm {
	var returns *map[string]awscloudwatch.IAlarm
	_jsii_.Get(
		j,
		"albZonalIsolatedImpactAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetAlbZonalIsolatedImpactAlarms(val *map[string]awscloudwatch.IAlarm) {
	_jsii_.Set(
		j,
		"albZonalIsolatedImpactAlarms",
		val,
	)
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) ApplicationLoadBalancers() *[]awselasticloadbalancingv2.IApplicationLoadBalancer {
	var returns *[]awselasticloadbalancingv2.IApplicationLoadBalancer
	_jsii_.Get(
		j,
		"applicationLoadBalancers",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetApplicationLoadBalancers(val *[]awselasticloadbalancingv2.IApplicationLoadBalancer) {
	_jsii_.Set(
		j,
		"applicationLoadBalancers",
		val,
	)
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) NatGateways() *map[string]*[]awsec2.CfnNatGateway {
	var returns *map[string]*[]awsec2.CfnNatGateway
	_jsii_.Get(
		j,
		"natGateways",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetNatGateways(val *map[string]*[]awsec2.CfnNatGateway) {
	_jsii_.Set(
		j,
		"natGateways",
		val,
	)
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) NatGWZonalIsolatedImpactAlarms() *map[string]awscloudwatch.IAlarm {
	var returns *map[string]awscloudwatch.IAlarm
	_jsii_.Get(
		j,
		"natGWZonalIsolatedImpactAlarms",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetNatGWZonalIsolatedImpactAlarms(val *map[string]awscloudwatch.IAlarm) {
	_jsii_.Set(
		j,
		"natGWZonalIsolatedImpactAlarms",
		val,
	)
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) ServiceName() *string {
	var returns *string
	_jsii_.Get(
		j,
		"serviceName",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability)SetServiceName(val *string) {
	if err := j.validateSetServiceNameParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"serviceName",
		val,
	)
}

