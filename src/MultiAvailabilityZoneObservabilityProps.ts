import { IMultiAvailabilityZoneObservabilityProps } from "./IMultiAvailabilityZoneObservabilityProps";
import { IBasicServiceMultiAZObservabilityProps } from "./services/props/IBasicServiceMultiAZObservabilityProps";
import { IInstrumentedServiceProps } from "./services/props/IInstrumentedServiceProps";

export class MultiAvailabilityZoneObservabilityProps implements IMultiAvailabilityZoneObservabilityProps
{
    /**
     * The properties for a basic service that does not emit its own
     * metrics or logs for latency and availability. This will create
     * alarms based on Application Load Balancer metrics and optionally
     * NAT Gateway metrics to determine single AZ impact. Specify either
     * this or instrumentedServiceObservabilityProps, but not both.
     */
    basicServiceObservabilityProps?: IBasicServiceMultiAZObservabilityProps;

    /**
     * The properties for a service that has implemented its own instrumentation
     * to emit availability and latency metrics. This will create alarms based
     * on those metrics to determine single AZ impact. Specify either this or
     * basicServiceObservabilityProps, but not both.
     */
    instrumentedServiceObservabilityProps?: IInstrumentedServiceProps;
}