import { IService } from "../../services/IService";
import { IOperationAlarmsAndRules } from "../IOperationAlarmsAndRules";

export interface IServiceAlarmsAndRulesProps
{
   service: IService;
   
   perOperationAlarmsAndRules: {[key: string]: IOperationAlarmsAndRules};
}