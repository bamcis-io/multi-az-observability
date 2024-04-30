import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IService } from "../IService";

/**
 * Service level alarms and rules using critical operations
 */
export interface IServiceAlarmsAndRules
{
    /**
     * The service these alarms and rules are for
     */
    service: IService;

    /**
     * The zonal aggregate isolated impact alarms. There is 1 alarm per AZ that
     * triggers for availability or latency impact to any critical operation in that AZ 
     * that indicates it has isolated impact as measured by canaries or server-side.
     */
    zonalAggregateIsolatedImpactAlarms: IAlarm[];

    /**
     * An alarm for regional impact of any critical operation as measured by the canary.
     */
    regionalAvailabilityCanaryAlarm: IAlarm;

    /**
     * An alarm for regional impact of any critical operation as measured by the server-side.
     */
    regionalAvailabilityServerSideAlarm: IAlarm;

    /**
     * An alarm for fault count exceeding a regional threshold for all critical operations.
     */
    regionalFaultCountServerSideAlarm: IAlarm;
}