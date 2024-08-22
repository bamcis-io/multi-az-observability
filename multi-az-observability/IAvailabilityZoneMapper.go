package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/bamcis-io/multi-az-observability/multi-az-observability/internal"
)

// A wrapper for the Availability Zone mapper construct that allows you to translate Availability Zone names to Availability Zone Ids and vice a versa using the mapping in the AWS account where this is deployed.
type IAvailabilityZoneMapper interface {
	constructs.IConstruct
	// Returns a reference that can be cast to a string array with all of the Availability Zone Ids.
	AllAvailabilityZoneIdsAsArray() awscdk.Reference
	// Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.
	//
	// You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
	// get a specific Availability Zone Id.
	AllAvailabilityZoneIdsAsCommaDelimitedList() *string
	// Gets all of the Availability Zone names in this Region as a comma delimited list.
	//
	// You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
	// get a specific Availability Zone Name.
	AllAvailabilityZoneNamesAsCommaDelimitedList() *string
	// Gets the Availability Zone Id for the given Availability Zone Name in this account.
	AvailabilityZoneId(availabilityZoneName *string) *string
	// Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account.
	AvailabilityZoneIdFromAvailabilityZoneLetter(letter *string) *string
	// Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided.
	AvailabilityZoneIdsAsArray(availabilityZoneNames *[]*string) *[]*string
	// Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.
	//
	// You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
	// get a specific Availability Zone Id.
	AvailabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames *[]*string) *string
	// Gets the Availability Zone Name for the given Availability Zone Id in this account.
	AvailabilityZoneName(availabilityZoneId *string) *string
	// Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1".
	RegionPrefixForAvailabilityZoneIds() *string
	// The function that does the mapping.
	Function() awslambda.IFunction
	SetFunction(f awslambda.IFunction)
	// The log group for the function's logs.
	LogGroup() awslogs.ILogGroup
	SetLogGroup(l awslogs.ILogGroup)
	// The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids.
	Mapper() awscdk.CustomResource
	SetMapper(m awscdk.CustomResource)
}

// The jsii proxy for IAvailabilityZoneMapper
type jsiiProxy_IAvailabilityZoneMapper struct {
	internal.Type__constructsIConstruct
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AllAvailabilityZoneIdsAsArray() awscdk.Reference {
	var returns awscdk.Reference

	_jsii_.Invoke(
		i,
		"allAvailabilityZoneIdsAsArray",
		nil, // no parameters
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AllAvailabilityZoneIdsAsCommaDelimitedList() *string {
	var returns *string

	_jsii_.Invoke(
		i,
		"allAvailabilityZoneIdsAsCommaDelimitedList",
		nil, // no parameters
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AllAvailabilityZoneNamesAsCommaDelimitedList() *string {
	var returns *string

	_jsii_.Invoke(
		i,
		"allAvailabilityZoneNamesAsCommaDelimitedList",
		nil, // no parameters
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AvailabilityZoneId(availabilityZoneName *string) *string {
	if err := i.validateAvailabilityZoneIdParameters(availabilityZoneName); err != nil {
		panic(err)
	}
	var returns *string

	_jsii_.Invoke(
		i,
		"availabilityZoneId",
		[]interface{}{availabilityZoneName},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AvailabilityZoneIdFromAvailabilityZoneLetter(letter *string) *string {
	if err := i.validateAvailabilityZoneIdFromAvailabilityZoneLetterParameters(letter); err != nil {
		panic(err)
	}
	var returns *string

	_jsii_.Invoke(
		i,
		"availabilityZoneIdFromAvailabilityZoneLetter",
		[]interface{}{letter},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AvailabilityZoneIdsAsArray(availabilityZoneNames *[]*string) *[]*string {
	if err := i.validateAvailabilityZoneIdsAsArrayParameters(availabilityZoneNames); err != nil {
		panic(err)
	}
	var returns *[]*string

	_jsii_.Invoke(
		i,
		"availabilityZoneIdsAsArray",
		[]interface{}{availabilityZoneNames},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AvailabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames *[]*string) *string {
	if err := i.validateAvailabilityZoneIdsAsCommaDelimitedListParameters(availabilityZoneNames); err != nil {
		panic(err)
	}
	var returns *string

	_jsii_.Invoke(
		i,
		"availabilityZoneIdsAsCommaDelimitedList",
		[]interface{}{availabilityZoneNames},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) AvailabilityZoneName(availabilityZoneId *string) *string {
	if err := i.validateAvailabilityZoneNameParameters(availabilityZoneId); err != nil {
		panic(err)
	}
	var returns *string

	_jsii_.Invoke(
		i,
		"availabilityZoneName",
		[]interface{}{availabilityZoneId},
		&returns,
	)

	return returns
}

func (i *jsiiProxy_IAvailabilityZoneMapper) RegionPrefixForAvailabilityZoneIds() *string {
	var returns *string

	_jsii_.Invoke(
		i,
		"regionPrefixForAvailabilityZoneIds",
		nil, // no parameters
		&returns,
	)

	return returns
}

func (j *jsiiProxy_IAvailabilityZoneMapper) Function() awslambda.IFunction {
	var returns awslambda.IFunction
	_jsii_.Get(
		j,
		"function",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IAvailabilityZoneMapper)SetFunction(val awslambda.IFunction) {
	if err := j.validateSetFunctionParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"function",
		val,
	)
}

func (j *jsiiProxy_IAvailabilityZoneMapper) LogGroup() awslogs.ILogGroup {
	var returns awslogs.ILogGroup
	_jsii_.Get(
		j,
		"logGroup",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IAvailabilityZoneMapper)SetLogGroup(val awslogs.ILogGroup) {
	if err := j.validateSetLogGroupParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"logGroup",
		val,
	)
}

func (j *jsiiProxy_IAvailabilityZoneMapper) Mapper() awscdk.CustomResource {
	var returns awscdk.CustomResource
	_jsii_.Get(
		j,
		"mapper",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_IAvailabilityZoneMapper)SetMapper(val awscdk.CustomResource) {
	if err := j.validateSetMapperParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"mapper",
		val,
	)
}

