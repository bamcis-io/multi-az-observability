import { Construct } from 'constructs';
import { IMultiAvailabilityZoneObservability } from './IMultiAvailabiliyZoneObservability';
import { MultiAvailabilityZoneObservabilityProps } from './MultiAvailabilityZoneObservabilityProps';
import { BasicServiceMultiAZObservability } from './services/BasicServiceMultiAZObservability';
import { InstrumentedServiceMultiAZObservability } from './services/InstrumentedServiceMultiAZObservability';

/**
 * The construct will create multi-AZ observability for your service based on the
 * parameters you provide. It will create alarms that indicate if a single AZ is
 * impacted so you can take appropriate action to mitigate the event, for example,
 * using zonal shift. It will also optionally create dashboards for your service so
 * you can visualize the metrics used to feed the alarms as well as the alarm states.
 */
export class MultiAvailabilityZoneObservability extends Construct implements IMultiAvailabilityZoneObservability {
  constructor(scope: Construct, id: string, props?: MultiAvailabilityZoneObservabilityProps) {
    super(scope, id);

    if (props !== undefined) {
      if (props.basicServiceObservabilityProps !== undefined && props.basicServiceObservabilityProps != null) {
        new BasicServiceMultiAZObservability(this, 'BasicServiceObservability', props.basicServiceObservabilityProps);
      } else if (props.instrumentedServiceObservabilityProps !== undefined && props.instrumentedServiceObservabilityProps != null) {
        new InstrumentedServiceMultiAZObservability(this, 'FullyInstrumentedServiceObservability', props.instrumentedServiceObservabilityProps);
      }
    }
  }
}