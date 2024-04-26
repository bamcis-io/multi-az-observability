import { BaseOperationZonalAlarmsAndRulesProps } from "./BaseOperationZonalAlarmsAndRulesProps";
import { IServerSideOperationZonalAlarmsAndRulesProps } from "./IServerSideOperationZonalAlarmsAndRulesProps";

/**
 * The server side alarm and rule properties for an operation
 */
export class ServerSideOperationZonalAlarmsAndRulesProps extends BaseOperationZonalAlarmsAndRulesProps implements IServerSideOperationZonalAlarmsAndRulesProps
{
    constructor()
    {
        super();
        this.nameSuffix = "-server";
    }
}