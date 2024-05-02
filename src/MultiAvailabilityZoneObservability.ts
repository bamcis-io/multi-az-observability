import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
import { BasicServiceMultiAZObservability } from "./BasicServiceMultiAZObservability";
export { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
export { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
export { IBasicServiceMultiAZObservabilityProps } from "./IBasicServiceMultiAZObservabilityProps";
export { OutlierDetectionAlgorithm } from "./utilities/OutlierDetectionAlgorithm";

export class MultiAvailabilityZoneObservability extends Construct implements IMultiAvailabilityZoneObservability
{
    constructor(scope: Construct, id: string, props: IMultiAvailabilityZoneObservabilityProps)
    {
        super(scope, id);
        if (props.basicServiceObservabilityProps !== undefined && props.basicServiceObservabilityProps != null)
        {
            new BasicServiceMultiAZObservability(this, "BasicServiceObservability", props.basicServiceObservabilityProps);
        }
    }
}