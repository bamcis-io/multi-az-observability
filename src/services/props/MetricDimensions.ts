export class MetricDimensions {
  staticDimensions: {[key: string]: string};

  availabilityZoneIdKey: string;

  regionKey?: string;

  constructor(staticDimensions: {[key: string]: string}, availabilityZoneIdKey: string, regionKey?: string) {
    this.staticDimensions = staticDimensions;
    this.availabilityZoneIdKey = availabilityZoneIdKey;
    this.regionKey = regionKey;
  }

  zonalDimensions(availabilityZoneId: string, region: string): {[key: string]: string} {
    let tmp: {[key: string]: string} = {};
    Object.assign(tmp, this.staticDimensions);
    tmp[this.availabilityZoneIdKey] = availabilityZoneId;

    if (this.regionKey !== undefined) {
      tmp[this.regionKey] = region;
    }

    return tmp;
  }

  regionalDimensions(region: string): {[key: string]: string} {
    let tmp: {[key: string]: string} = {};
    Object.assign(tmp, this.staticDimensions);

    if (this.regionKey !== undefined) {
      tmp[this.regionKey] = region;
    }

    return tmp;
  }
}