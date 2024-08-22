//go:build !no_runtime_type_checking

package multi-az-observability

import (
	"fmt"

	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
)

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdParameters(availabilityZoneName *string) error {
	if availabilityZoneName == nil {
		return fmt.Errorf("parameter availabilityZoneName is required, but nil was provided")
	}

	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdFromAvailabilityZoneLetterParameters(letter *string) error {
	if letter == nil {
		return fmt.Errorf("parameter letter is required, but nil was provided")
	}

	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdsAsArrayParameters(availabilityZoneNames *[]*string) error {
	if availabilityZoneNames == nil {
		return fmt.Errorf("parameter availabilityZoneNames is required, but nil was provided")
	}

	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdsAsCommaDelimitedListParameters(availabilityZoneNames *[]*string) error {
	if availabilityZoneNames == nil {
		return fmt.Errorf("parameter availabilityZoneNames is required, but nil was provided")
	}

	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneNameParameters(availabilityZoneId *string) error {
	if availabilityZoneId == nil {
		return fmt.Errorf("parameter availabilityZoneId is required, but nil was provided")
	}

	return nil
}

func validateAvailabilityZoneMapper_IsConstructParameters(x interface{}) error {
	if x == nil {
		return fmt.Errorf("parameter x is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetFunctionParameters(val awslambda.IFunction) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetLogGroupParameters(val awslogs.ILogGroup) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetMapperParameters(val awscdk.CustomResource) error {
	if val == nil {
		return fmt.Errorf("parameter val is required, but nil was provided")
	}

	return nil
}

func validateNewAvailabilityZoneMapperParameters(scope constructs.Construct, id *string, props *AvailabilityZoneMapperProps) error {
	if scope == nil {
		return fmt.Errorf("parameter scope is required, but nil was provided")
	}

	if id == nil {
		return fmt.Errorf("parameter id is required, but nil was provided")
	}

	if err := _jsii_.ValidateStruct(props, func() string { return "parameter props" }); err != nil {
		return err
	}

	return nil
}

