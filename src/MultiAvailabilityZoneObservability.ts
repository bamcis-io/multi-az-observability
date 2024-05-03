import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
import { BasicServiceMultiAZObservability } from "./services/BasicServiceMultiAZObservability";
import { InstrumentedServiceMultiAZObservability } from "./services/InstrumentedServiceMultiAZObservability";
export { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
export { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
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
        else if (props.instrumentedServiceObservabilityProps !== undefined && props.instrumentedServiceObservabilityProps != null)
        {
            new InstrumentedServiceMultiAZObservability(this, "FullyInstrumentedServiceObservability", {
                service: props.instrumentedServiceObservabilityProps.service,
                outlierThreshold: props.instrumentedServiceObservabilityProps.outlierThreshold,
                loadBalancer: props.instrumentedServiceObservabilityProps.loadBalancer,
                createDashboard: props.instrumentedServiceObservabilityProps.createDashboard,
                availabilityZoneMapper: props.instrumentedServiceObservabilityProps.availabilityZoneMapper,
                interval: props.instrumentedServiceObservabilityProps.interval
            });
        } 
    }
}