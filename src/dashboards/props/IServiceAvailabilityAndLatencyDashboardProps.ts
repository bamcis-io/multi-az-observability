import { CfnInsightRule, IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IService } from "../../IService";
import { Duration } from "aws-cdk-lib";

/**
 * Properties for creating a service level dashboard
 */
export interface IServiceAvailabilityAndLatencyDashboardProps
{
    /**
     * The service for the dashboard
     */
    service: IService;

    /**
     * The AZ isolated impact alarms, one for each AZ
     */
    zonalAggregateAlarms: IAlarm[];

    /**
     * The aggregate regional impact alarm, typically a fault
     * count across all critical operations 
     */
    aggregateRegionalAlarm: IAlarm;

    /**
     * The Availability Zones contributing to fault count
     */
    azContributorsToFaults: CfnInsightRule;

    /**
     * The interval for the dashboard
     */
    interval: Duration;
}