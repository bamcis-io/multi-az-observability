/**
 * Interface for defining the operation's dimensions
 */
export interface IMetricDimensions {
    /**
     * Gets the regional dimensions for these metrics, expected to return something
     * like {
     *   "Region": "us-east-1",
     *   "Operation": "Ride",
     *   "Service": "WildRydes"
     * }
     * @param region
     */
    regionalDimensions(region: string): {
        [key: string]: string;
    };
    /**
     * Gets the zonal dimensions for these metrics, expected to return something like
     * {
     *   "Region": "us-east-1",
     *   "AZ-ID": "use1-az1",
     *   "Operation": "Ride",
     *   "Service": "WildRydes"
     * }
     * @param availabilityZoneId
     * @param region
     */
    zonalDimensions(availabilityZoneId: string, region: string): {
        [key: string]: string;
    };
}
