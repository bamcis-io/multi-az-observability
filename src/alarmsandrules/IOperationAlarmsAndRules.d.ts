import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";
import { ICanaryOperationRegionalAlarmsAndRules } from "./ICanaryOperationRegionalAlarmsAndRules";
import { IServerSideOperationZonalAlarmsAndRules } from "./IServerSideOperationZonalAlarmsAndRules";
import { ICanaryOperationZonalAlarmsAndRules } from "./ICanaryOperationZonalAlarmsAndRules";
import { IOperation } from "../services/IOperation";
/**
 * Creates alarms and rules for an operation for both regional and zonal metrics
 */
export interface IOperationAlarmsAndRules {
    /**
     * The operation the alarms and rules are created for
     */
    operation: IOperation;
    /**
     * The server side regional alarms and rules
     */
    serverSideRegionalAlarmsAndRules: IServerSideOperationRegionalAlarmsAndRules;
    /**
     * The canary regional alarms and rules
     */
    canaryRegionalAlarmsAndRules?: ICanaryOperationRegionalAlarmsAndRules;
    /**
     * The aggregate regional alarm that looks at both canary and server
     * side impact alarms for latency and availability
     */
    aggregateRegionalAlarm: IAlarm;
    /**
     * The server side zonal alarms and rules
     */
    serverSideZonalAlarmsAndRules: IServerSideOperationZonalAlarmsAndRules[];
    /**
     * The canary zonal alarms and rules
     */
    canaryZonalAlarmsAndRules?: ICanaryOperationZonalAlarmsAndRules[];
    /**
     * The aggregate zonal alarms, one per AZ. Each alarm indicates there is either
     * latency or availability impact in that AZ, and the AZ is an outlier for
     * availability or latency impact. Both server side and canary metrics are
     * evaluated
     */
    aggregateZonalAlarms: IAlarm[];
}