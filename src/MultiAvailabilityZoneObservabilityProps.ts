import { BasicServiceMultiAZObservabilityProps } from "./services/props/BasicServiceMultiAZObservabilityProps";
import { InstrumentedServiceProps } from "./services/props/InstrumentedServiceProps";

/**
 * The properties for creating multi-AZ observability alarms and dashboards.
 */
export interface MultiAvailabilityZoneObservabilityProps
{
    /**
     * The properties for a basic service that does not emit its own
     * metrics or logs for latency and availability. This will create
     * alarms based on Application Load Balancer metrics and optionally
     * NAT Gateway metrics to determine single AZ impact. Specify either
     * this or instrumentedServiceObservabilityProps, but not both.
     * 
     * @default - No basic service observability alarms are created
     */
    readonly basicServiceObservabilityProps?: BasicServiceMultiAZObservabilityProps;

    /**
     * The properties for a service that has implemented its own instrumentation
     * to emit availability and latency metrics. This will create alarms based
     * on those metrics to determine single AZ impact. Specify either this or
     * basicServiceObservabilityProps, but not both.
     * 
     * @default - No instrumented service observability alarms are created
     */
    readonly instrumentedServiceObservabilityProps?: InstrumentedServiceProps;
}