import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
import { BasicServiceMultiAZObservability } from "./services/BasicServiceMultiAZObservability";
import { InstrumentedServiceMultiAZObservability } from "./services/InstrumentedServiceMultiAZObservability";
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
export { IContributorInsightRuleDetails } from "./alarmsandrules/IContributorInsightRuleDetails";
export { ICanaryMetrics } from "./services/ICanaryMetrics";

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