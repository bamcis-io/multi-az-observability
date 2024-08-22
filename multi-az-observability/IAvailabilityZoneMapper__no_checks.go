//go:build no_runtime_type_checking

package multi-az-observability

// Building without runtime type checking enabled, so all the below just return nil

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdParameters(availabilityZoneName *string) error {
	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdFromAvailabilityZoneLetterParameters(letter *string) error {
	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdsAsArrayParameters(availabilityZoneNames *[]*string) error {
	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneIdsAsCommaDelimitedListParameters(availabilityZoneNames *[]*string) error {
	return nil
}

func (i *jsiiProxy_IAvailabilityZoneMapper) validateAvailabilityZoneNameParameters(availabilityZoneId *string) error {
	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetFunctionParameters(val awslambda.IFunction) error {
	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetLogGroupParameters(val awslogs.ILogGroup) error {
	return nil
}

func (j *jsiiProxy_IAvailabilityZoneMapper) validateSetMapperParameters(val awscdk.CustomResource) error {
	return nil
}

