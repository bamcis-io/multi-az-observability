//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (m *jsiiProxy_MetricDimensions) validateRegionalDimensionsParameters(region *string) error {
	return nil
}

func (m *jsiiProxy_MetricDimensions) validateZonalDimensionsParameters(availabilityZoneId *string, region *string) error {
	return nil
}

func (j *jsiiProxy_MetricDimensions) validateSetAvailabilityZoneIdKeyParameters(val *string) error {
	return nil
}

func (j *jsiiProxy_MetricDimensions) validateSetStaticDimensionsParameters(val *map[string]*string) error {
	return nil
}

func validateNewMetricDimensionsParameters(staticDimensions *map[string]*string, availabilityZoneIdKey *string) error {
	return nil
}

