import { IOperationAlarmsAndRules } from "../IOperationAlarmsAndRules";
import { IService } from "../../IService";

export interface IServiceAlarmsAndRulesProps
{
   service: IService;
   
   //perOperationAlarmsAndRules: {[key: string]: IOperationAlarmsAndRules}

   perOperationAlarmsAndRules: Record<string, IOperationAlarmsAndRules>;
}