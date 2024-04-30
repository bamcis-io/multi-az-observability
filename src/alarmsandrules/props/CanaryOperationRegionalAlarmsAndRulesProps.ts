import { BaseOperationRegionalAlarmsAndRulesProps } from "./BaseOperationRegionalAlarmsAndRulesProps";
import { ICanaryOperationRegionalAlarmsAndRulesProps } from "./ICanaryOperationRegionalAlarmsAndRulesProps";

/**
 * Canary metric properties for an operation at the regional level
 */
export class CanaryOperationRegionalAlarmsAndRulesProps extends BaseOperationRegionalAlarmsAndRulesProps implements ICanaryOperationRegionalAlarmsAndRulesProps
{
    constructor()
    {
        super();
        this.nameSuffix = "-canary"
    }
}