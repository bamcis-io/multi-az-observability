/**
 * Properties for the AZ mapper
 */
export interface AvailabilityZoneMapperProps {
  /**
   * The currently in use Availability Zone names which
   * constrains the list of AZ IDs that are returned
   *
   * @default - No names are provided and the mapper returns
   * all AZs in the region in its lists
   */
  readonly availabilityZoneNames?: string[];
}
