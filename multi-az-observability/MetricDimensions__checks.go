//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"
)

func (m *jsiiProxy_MetricDimensions) validateRegionalDimensionsParameters(region *string) error {
	if region == nil {
		return fmt.Errorf("parameter region is required, but nil was provided")
	}

	return nil
}

func (m *jsiiProxy_MetricDimensions) validateZonalDimensionsParameters(availabilityZoneId *string, region *string) error {
	if availabilityZoneId == nil {
		return fmt.Errorf("parameter availabilityZoneId is required, but nil was provided")
	}

	if region == nil {
		return fmt.Errorf("parameter region is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_MetricDimensions) validateSetAvailabilityZoneIdKeyParameters(val *string) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_MetricDimensions) validateSetStaticDimensionsParameters(val *map[string]*string) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func validateNewMetricDimensionsParameters(staticDimensions *map[string]*string, availabilityZoneIdKey *string) error {
	if staticDimensions == nil {
		return fmt.Errorf("parameter staticDimensions is required, but nil was provided")
	}

	if availabilityZoneIdKey == nil {
		return fmt.Errorf("parameter availabilityZoneIdKey is required, but nil was provided")
	}

	return nil
}

