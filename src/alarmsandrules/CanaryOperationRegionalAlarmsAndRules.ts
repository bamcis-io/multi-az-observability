import { Construct } from "constructs";

import { ICanaryOperationRegionalAlarmsAndRulesProps } from "./props/ICanaryOperationRegionalAlarmsAndRulesProps";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";
import { ICanaryOperationRegionalAlarmsAndRules } from "./ICanaryOperationRegionalAlarmsAndRules";

export class CanaryOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules implements ICanaryOperationRegionalAlarmsAndRules
{
    constructor(scope: Construct, id: string, props: ICanaryOperationRegionalAlarmsAndRulesProps)
    {
        super(scope, id, props)
    }
}