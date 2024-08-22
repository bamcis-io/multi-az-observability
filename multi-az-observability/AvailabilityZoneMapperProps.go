package multi-az-observability


// Properties for the AZ mapper.
type AvailabilityZoneMapperProps struct {
	// The currently in use Availability Zone names which constrains the list of AZ IDs that are returned.
	// Default: - No names are provided and the mapper returns
	// all AZs in the region in its lists.
	//
	AvailabilityZoneNames *[]*string `field:"optional" json:"availabilityZoneNames" yaml:"availabilityZoneNames"`
}

