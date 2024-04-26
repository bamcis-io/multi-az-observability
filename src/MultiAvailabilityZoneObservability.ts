import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";

//TODO: start creating input props for 1/application with just custom metrics, 2/application with custom
// metrics and logs files, 3/application with only ALB and TGW
export class MultiAvailabilityZoneObservability extends Construct implements IMultiAvailabilityZoneObservability
{
    constructor(scope: Construct, id: string, props: IMultiAvailabilityZoneObservabilityProps)
    {
        super(scope, id);
    }
}