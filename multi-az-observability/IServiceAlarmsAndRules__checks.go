//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
)

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetRegionalAvailabilityOrLatencyServerSideAlarmParameters(val awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetRegionalAvailabilityServerSideAlarmParameters(val awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetRegionalFaultCountServerSideAlarmParameters(val awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetServiceParameters(val IService) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetZonalAggregateIsolatedImpactAlarmsParameters(val *[]awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IServiceAlarmsAndRules) validateSetZonalServerSideIsolatedImpactAlarmsParameters(val *[]awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

