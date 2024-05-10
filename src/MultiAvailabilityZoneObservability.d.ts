import { Construct } from "constructs";
import { IMultiAvailabilityZoneObservability } from "./IMultiAvailabiliyZoneObservability";
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
export { AddCanaryTestProps } from "./canaries/props/AddCanaryTestProps";
export { ICanaryMetrics } from "./services/ICanaryMetrics";
export { IContributorInsightRuleDetails } from "./services/IContributorInsightRuleDetails";
export { AvailabilityZoneMapper } from "./utilities/AvailabilityZoneMapper";
export { AvailabilityZoneMapperProps } from "./utilities/AvailabilityZoneMapperProps";
export { ServiceProps } from "./services/props/ServiceProps";
export { CanaryMetrics } from "./services/CanaryMetrics";
export { CanaryMetricProps } from "./services/props/CanaryMetricProps";
export { OperationProps } from "./services/props/OperationProps";
export { OperationMetricDetailsProps } from "./services/props/OperationMetricDetailsProps";
export { IMetricDimensions } from "./services/IMetricDimensions";
export { ContributorInsightRuleDetails } from "./services/ContributorInsightRuleDetails";
export { ContributorInsightRuleDetailsProps } from "./services/props/ContributorInsightRuleDetailsProps";
/**
 * The construct will create multi-AZ observability for your service based on the
 * parameters you provide. It will create alarms that indicate if a single AZ is
 * impacted so you can take appropriate action to mitigate the event, for example,
 * using zonal shift. It will also optionally create dashboards for your service so
 * you can visualize the metrics used to feed the alarms as well as the alarm states.
 */
export declare class MultiAvailabilityZoneObservability extends Construct implements IMultiAvailabilityZoneObservability {
    constructor(scope: Construct, id: string, props?: MultiAvailabilityZoneObservabilityProps);
}
