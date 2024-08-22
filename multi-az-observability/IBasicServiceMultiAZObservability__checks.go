//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
)

func (j *jsiiProxy_IBasicServiceMultiAZObservability) validateSetAggregateZonalIsolatedImpactAlarmsParameters(val *map[string]awscloudwatch.IAlarm) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) validateSetServiceNameParameters(val *string) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

