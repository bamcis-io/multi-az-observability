import { Construct } from "constructs";

import { ICanaryOperationRegionalAlarmsAndRulesProps } from "./ICanaryOperationRegionalAlarmsAndRulesProps";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";

export class CanaryOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules
{
    constructor(scope: Construct, id: string, props: ICanaryOperationRegionalAlarmsAndRulesProps)
    {
        super(scope, id, props)
    }
}