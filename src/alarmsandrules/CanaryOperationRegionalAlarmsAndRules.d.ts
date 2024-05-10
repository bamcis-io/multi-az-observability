import { Construct } from "constructs";
import { CanaryOperationRegionalAlarmsAndRulesProps } from "./props/CanaryOperationRegionalAlarmsAndRulesProps";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";
import { ICanaryOperationRegionalAlarmsAndRules } from "./ICanaryOperationRegionalAlarmsAndRules";
export declare class CanaryOperationRegionalAlarmsAndRules extends BaseOperationRegionalAlarmsAndRules implements ICanaryOperationRegionalAlarmsAndRules {
    constructor(scope: Construct, id: string, props: CanaryOperationRegionalAlarmsAndRulesProps);
}
