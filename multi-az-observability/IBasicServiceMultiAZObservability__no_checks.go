//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (j *jsiiProxy_IBasicServiceMultiAZObservability) validateSetAggregateZonalIsolatedImpactAlarmsParameters(val *map[string]awscloudwatch.IAlarm) error {
	return nil
}

func (j *jsiiProxy_IBasicServiceMultiAZObservability) validateSetServiceNameParameters(val *string) error {
	return nil
}

