import { BaseOperationRegionalAlarmsAndRulesProps } from "./BaseOperationRegionalAlarmsAndRulesProps";
import { IServerSideOperationRegionalAlarmsAndRulesProps } from "./IServerSideOperationRegionalAlarmsAndRulesProps";

/**
 * The server side alarm and rule properties for an operation
 */
export class ServerSideOperationRegionalAlarmsAndRulesProps extends BaseOperationRegionalAlarmsAndRulesProps implements IServerSideOperationRegionalAlarmsAndRulesProps
{
    constructor()
    {
        super();
        this.nameSuffix = "-server"
    }
}