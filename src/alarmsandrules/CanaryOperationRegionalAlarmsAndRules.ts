import { Construct } from 'constructs';

import { BaseOperationRegionalAlarmsAndRules } from './BaseOperationRegionalAlarmsAndRules';
import { ICanaryOperationRegionalAlarmsAndRules } from './ICanaryOperationRegionalAlarmsAndRules';
import { CanaryOperationRegionalAlarmsAndRulesProps } from './props/CanaryOperationRegionalAlarmsAndRulesProps';

export class CanaryOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules implements ICanaryOperationRegionalAlarmsAndRules {
  constructor(scope: Construct, id: string, props: CanaryOperationRegionalAlarmsAndRulesProps) {
    super(scope, id, props);
  }
}