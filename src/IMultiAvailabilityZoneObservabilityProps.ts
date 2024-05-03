import { IBasicServiceMultiAZObservabilityProps } from "./services/props/IBasicServiceMultiAZObservabilityProps";
import { IInstrumentedServiceProps } from "./services/props/IInstrumentedServiceProps";

export interface IMultiAvailabilityZoneObservabilityProps
{
    basicServiceObservabilityProps?: IBasicServiceMultiAZObservabilityProps;

    instrumentedServiceObservabilityProps?: IInstrumentedServiceProps;
}