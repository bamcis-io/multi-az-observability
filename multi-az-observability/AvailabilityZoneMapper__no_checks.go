//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdParameters(availabilityZoneName *string) error {
	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdFromAvailabilityZoneLetterParameters(letter *string) error {
	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdsAsArrayParameters(availabilityZoneNames *[]*string) error {
	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneIdsAsCommaDelimitedListParameters(availabilityZoneNames *[]*string) error {
	return nil
}

func (a *jsiiProxy_AvailabilityZoneMapper) validateAvailabilityZoneNameParameters(availabilityZoneId *string) error {
	return nil
}

func validateAvailabilityZoneMapper_IsConstructParameters(x interface{}) error {
	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetFunctionParameters(val awslambda.IFunction) error {
	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetLogGroupParameters(val awslogs.ILogGroup) error {
	return nil
}

func (j *jsiiProxy_AvailabilityZoneMapper) validateSetMapperParameters(val awscdk.CustomResource) error {
	return nil
}

func validateNewAvailabilityZoneMapperParameters(scope constructs.Construct, id *string, props *AvailabilityZoneMapperProps) error {
	return nil
}

