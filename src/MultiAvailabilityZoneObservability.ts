import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
import { BasicServiceMultiAZObservability } from "./services/BasicServiceMultiAZObservability";
import { InstrumentedServiceMultiAZObservability } from "./services/InstrumentedServiceMultiAZObservability";
import { MultiAvailabilityZoneObservabilityProps } from "./MultiAvailabilityZoneObservabilityProps";
export { MultiAvailabilityZoneObservabilityProps } from "./MultiAvailabilityZoneObservabilityProps";
export { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
export { OutlierDetectionAlgorithm } from "./utilities/OutlierDetectionAlgorithm";
export { BasicServiceMultiAZObservabilityProps } from "./services/props/BasicServiceMultiAZObservabilityProps";
export { InstrumentedServiceMultiAZObservabilityProps } from "./services/props/InstrumentedServiceMultiAZObservabilityProps";
export { IService } from "./services/IService";
export { Service } from "./services/Service";
export { IAvailabilityZoneMapper } from "./utilities/IAvailabilityZoneMapper";
export { IOperation } from "./services/IOperation";
export { Operation } from "./services/Operation";
export { OperationMetricDetails } from "./services/OperationMetricDetails";
export { IOperationMetricDetails } from "./services/IOperationMetricDetails";
export { CanaryTestProps } from "./canaries/props/CanaryTestProps";
export { ICanaryMetrics } from "./services/ICanaryMetrics";
export { IContributorInsightRuleDetails } from "./services/IContributorInsightRuleDetails";
export { AvailabilityZoneMapper } from "./utilities/AvailabilityZoneMapper";
export { AvailabilityZoneMapperProps } from "./utilities/AvailabilityZoneMapperProps";
export { ServiceProps } from "./services/props/ServiceProps";
export { CanaryMetrics } from "./services/CanaryMetrics";
export { CanaryMetricProps } from "./services/props/CanaryMetricProps";
export { OperationProps } from "./services/props/OperationProps";
export { OperationMetricDetailsProps } from "./services/props/OperationMetricDetailsProps";
export { IDimensions } from "./services/IDimensions";
export { ContributorInsightRuleDetails } from "./services/ContributorInsightRuleDetails";
export { ContributorInsightRuleDetailsProps } from "./services/props/ContributorInsightRuleDetailsProps";

/**
 * The construct will create multi-AZ observability for your service based on the 
 * parameters you provide. It will create alarms that indicate if a single AZ is
 * impacted so you can take appropriate action to mitigate the event, for example,
 * using zonal shift. It will also optionally create dashboards for your service so
 * you can visualize the metrics used to feed the alarms as well as the alarm states.
 */
export class MultiAvailabilityZoneObservability extends Construct implements IMultiAvailabilityZoneObservability
{
    constructor(scope: Construct, id: string, props?: MultiAvailabilityZoneObservabilityProps)
    {
        super(scope, id);

        if (props !== undefined)
        {
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
                    createDashboards: props.instrumentedServiceObservabilityProps.createDashboards,
                    interval: props.instrumentedServiceObservabilityProps.interval,
                    addSyntheticCanaries: props.instrumentedServiceObservabilityProps.addSyntheticCanaries
                });
            } 
        }
    }
}