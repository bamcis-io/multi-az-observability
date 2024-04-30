import { BaseOperationZonalAlarmsAndRulesProps } from "./BaseOperationZonalAlarmsAndRulesProps";
import { ICanaryOperationZonalAlarmsAndRulesProps } from "./ICanaryOperationZonalAlarmsAndRulesProps";

/**
 * Canary metrics for an operation at the zonal level
 */
export class CanaryOperationZonalAlarmsAndRulesProps extends BaseOperationZonalAlarmsAndRulesProps implements ICanaryOperationZonalAlarmsAndRulesProps
{
    constructor()
    {
        super();
        this.nameSuffix = "-canary"
    }
}