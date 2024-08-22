//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func validateBasicServiceMultiAZObservability_IsConstructParameters(x interface{}) error {
	return nil
}

func (j *jsiiProxy_BasicServiceMultiAZObservability) validateSetAggregateZonalIsolatedImpactAlarmsParameters(val *map[string]awscloudwatch.IAlarm) error {
	return nil
}

func (j *jsiiProxy_BasicServiceMultiAZObservability) validateSetServiceNameParameters(val *string) error {
	return nil
}

func validateNewBasicServiceMultiAZObservabilityParameters(scope constructs.Construct, id *string, props *BasicServiceMultiAZObservabilityProps) error {
	return nil
}

