import { Construct } from "constructs";
import { InstrumentedServiceMultiAZObservabilityProps } from "./props/InstrumentedServiceMultiAZObservabilityProps";
import { OperationAlarmsAndRules } from "../alarmsandrules/OperationAlarmsAndRules";
import { ServiceAlarmsAndRules } from "../alarmsandrules/ServiceAlarmsAndRules";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
export declare class InstrumentedServiceMultiAZObservability extends Construct {
    /**
    * Key represents the operation name and the value is the set
    * of zonal alarms and rules for that operation. The values themselves
    * are dictionaries that have a key for each AZ ID.
    */
    readonly perOperationAlarmsAndRules: {
        [key: string]: OperationAlarmsAndRules;
    };
    readonly serviceAlarms: ServiceAlarmsAndRules;
    readonly operationDashboards: Dashboard[];
    readonly serviceDashboard?: Dashboard;
    constructor(scope: Construct, id: string, props: InstrumentedServiceMultiAZObservabilityProps);
}
