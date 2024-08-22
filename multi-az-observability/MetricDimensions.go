package multi-az-observability

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/bamcis-io/multi-az-observability/multi-az-observability/jsii"
)

// Provides the ability to get operation specific metric dimensions for metrics at the regional level as well as Availability Zone level.
type MetricDimensions interface {
	// The key used to specify an Availability Zone specific metric dimension, for example: "AZ-ID".
	AvailabilityZoneIdKey() *string
	SetAvailabilityZoneIdKey(val *string)
	// The key used for the Region in your dimensions, if you provide one.
	// Default: - A region specific key and value is not added to your
	// zonal and regional metric dimensions.
	//
	RegionKey() *string
	SetRegionKey(val *string)
	// The dimensions that are the same for all Availability Zones for example: {   "Operation": "ride",   "Service": "WildRydes" }.
	StaticDimensions() *map[string]*string
	SetStaticDimensions(val *map[string]*string)
	// Gets the regional dimensions for these metrics by combining the static metric dimensions with the keys provided the optional Region key, expected to return something like {   "Region": "us-east-1",   "Operation": "ride",   "Service": "WildRydes" }.
	RegionalDimensions(region *string) *map[string]*string
	// Gets the zonal dimensions for these metrics by combining the static metric dimensions with the keys provided for Availability Zone and optional Region, expected to return something like {   "Region": "us-east-1",   "AZ-ID": "use1-az1",   "Operation": "ride",   "Service": "WildRydes" }.
	ZonalDimensions(availabilityZoneId *string, region *string) *map[string]*string
}

// The jsii proxy struct for MetricDimensions
type jsiiProxy_MetricDimensions struct {
	_ byte // padding
}

func (j *jsiiProxy_MetricDimensions) AvailabilityZoneIdKey() *string {
	var returns *string
	_jsii_.Get(
		j,
		"availabilityZoneIdKey",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_MetricDimensions) RegionKey() *string {
	var returns *string
	_jsii_.Get(
		j,
		"regionKey",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_MetricDimensions) StaticDimensions() *map[string]*string {
	var returns *map[string]*string
	_jsii_.Get(
		j,
		"staticDimensions",
		&returns,
	)
	return returns
}


func NewMetricDimensions(staticDimensions *map[string]*string, availabilityZoneIdKey *string, regionKey *string) MetricDimensions {
	_init_.Initialize()

	if err := validateNewMetricDimensionsParameters(staticDimensions, availabilityZoneIdKey); err != nil {
		panic(err)
	}
	j := jsiiProxy_MetricDimensions{}

	_jsii_.Create(
		"multi-az-observability.MetricDimensions",
		[]interface{}{staticDimensions, availabilityZoneIdKey, regionKey},
		&j,
	)

	return &j
}

func NewMetricDimensions_Override(m MetricDimensions, staticDimensions *map[string]*string, availabilityZoneIdKey *string, regionKey *string) {
	_init_.Initialize()

	_jsii_.Create(
		"multi-az-observability.MetricDimensions",
		[]interface{}{staticDimensions, availabilityZoneIdKey, regionKey},
		m,
	)
}

func (j *jsiiProxy_MetricDimensions)SetAvailabilityZoneIdKey(val *string) {
	if err := j.validateSetAvailabilityZoneIdKeyParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"availabilityZoneIdKey",
		val,
	)
}

func (j *jsiiProxy_MetricDimensions)SetRegionKey(val *string) {
	_jsii_.Set(
		j,
		"regionKey",
		val,
	)
}

func (j *jsiiProxy_MetricDimensions)SetStaticDimensions(val *map[string]*string) {
	if err := j.validateSetStaticDimensionsParameters(val); err != nil {
		panic(err)
	}
	_jsii_.Set(
		j,
		"staticDimensions",
		val,
	)
}

func (m *jsiiProxy_MetricDimensions) RegionalDimensions(region *string) *map[string]*string {
	if err := m.validateRegionalDimensionsParameters(region); err != nil {
		panic(err)
	}
	var returns *map[string]*string

	_jsii_.Invoke(
		m,
		"regionalDimensions",
		[]interface{}{region},
		&returns,
	)

	return returns
}

func (m *jsiiProxy_MetricDimensions) ZonalDimensions(availabilityZoneId *string, region *string) *map[string]*string {
	if err := m.validateZonalDimensionsParameters(availabilityZoneId, region); err != nil {
		panic(err)
	}
	var returns *map[string]*string

	_jsii_.Invoke(
		m,
		"zonalDimensions",
		[]interface{}{availabilityZoneId, region},
		&returns,
	)

	return returns
}

