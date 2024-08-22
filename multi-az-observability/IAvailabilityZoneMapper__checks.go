//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
)

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdParameters(availabilityZoneName *string) error {
	if availabilityZoneName == nil {
		return fmt.Errorf("parameter availabilityZoneName is required, but nil was provided")
	}

	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdFromAvailabilityZoneLetterParameters(letter *string) error {
	if letter == nil {
		return fmt.Errorf("parameter letter is required, but nil was provided")
	}

	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdsAsArrayParameters(availabilityZoneNames *[]*string) error {
	if availabilityZoneNames == nil {
		return fmt.Errorf("parameter availabilityZoneNames is required, but nil was provided")
	}

	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdsAsCommaDelimitedListParameters(availabilityZoneNames *[]*string) error {
	if availabilityZoneNames == nil {
		return fmt.Errorf("parameter availabilityZoneNames is required, but nil was provided")
	}

	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneNameParameters(availabilityZoneId *string) error {
	if availabilityZoneId == nil {
		return fmt.Errorf("parameter availabilityZoneId is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetFunctionParameters(val awslambda.IFunction) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetLogGroupParameters(val awslogs.ILogGroup) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetMapperParameters(val awscdk.CustomResource) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

