import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { IService } from '../../services/IService';
import { IOperationAlarmsAndRules } from '../IOperationAlarmsAndRules';

export interface ServiceAlarmsAndRulesProps {
  readonly service: IService;

  readonly perOperationAlarmsAndRules: { [key: string]: IOperationAlarmsAndRules };

  /**
    * The AZ Mapper
    */
  readonly azMapper: IAvailabilityZoneMapper;
}