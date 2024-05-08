import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { BasicServiceMultiAZObservability } from "./services/BasicServiceMultiAZObservability";
import { InstrumentedServiceMultiAZObservability } from "./services/InstrumentedServiceMultiAZObservability";
//import { MultiAvailabilityZoneObservabilityProps } from "./MultiAvailabilityZoneObservabilityProps";
import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
export { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
export { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
export { OutlierDetectionAlgorithm } from "./utilities/OutlierDetectionAlgorithm";
export { IBasicServiceMultiAZObservabilityProps } from "./services/props/IBasicServiceMultiAZObservabilityProps";
export { IInstrumentedServiceProps } from "./services/props/IInstrumentedServiceProps";
export { IService } from "./services/IService";
export { IAvailabilityZoneMapper } from "./utilities/IAvailabilityZoneMapper";
export { IOperation } from "./services/IOperation"
export { IOperationMetricDetails } from "./services/IOperationMetricDetails";
export { ICanaryTestProps } from "./canaries/props/ICanaryTestProps";
export { ICanaryMetrics } from "./services/ICanaryMetrics";
export { IContributorInsightRuleDetails } from "./services/IContributorInsightRuleDetails";
//export { MultiAvailabilityZoneObservabilityProps } from "./MultiAvailabilityZoneObservabilityProps";

/**
 * The construct will create multi-AZ observability for your service based on the 
 * parameters you provide. It will create alarms that indicate if a single AZ is
 * impacted so you can take appropriate action to mitigate the event, for example,
 * using zonal shift. It will also optionally create dashboards for your service so
 * you can visualize the metrics used to feed the alarms as well as the alarm states.
 */
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