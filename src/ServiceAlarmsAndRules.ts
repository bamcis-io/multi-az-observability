import { Construct } from "constructs";
import { IOperationAlarmsAndRules } from "./IOperationAlarmsAndRules";
import { IService } from "./IService";
import { IServiceAlarmsAndRules } from "./IServiceAlarmsAndRules";

export class ServiceAlarmsAndRules extends Construct implements IServiceAlarmsAndRules
{
    service: IService;
    perOperationAlarmsAndRules: { [key: string]: IOperationAlarmsAndRules; };
}