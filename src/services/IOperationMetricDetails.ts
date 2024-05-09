import { Duration } from "aws-cdk-lib";
import { Unit } from "aws-cdk-lib/aws-cloudwatch";

export interface IOperationMetricDetails
{
    /**
     * The operation these metric details are for
     */
    readonly operationName: string;

    /**
     * The CloudWatch metric namespace for these metrics
     */
    readonly metricNamespace: string;  
        
    /**
     * The names of success indicating metrics
     */
    readonly successMetricNames: string[];   
    /**
     * The names of fault indicating metrics
     */
    readonly faultMetricNames: string[]      
    /**
     * The statistic used for alarms, for availability metrics this should
     * be "Sum", for latency metrics it could something like "p99" or "p99.9"
     */
    readonly alarmStatistic: string  
    /**
     * The statistics for successes you want to appear on dashboards, for example, with
     * latency metrics, you might want p50, p99, and tm99. For availability
     * metrics this will typically just be "Sum".
     */
    readonly graphedSuccessStatistics?: string[]     
    /**
     * The statistics for faults you want to appear on dashboards, for example, with
     * latency metrics, you might want p50, p99, and tm99. For availability
     * metrics this will typically just be "Sum".
     */
    readonly graphedFaultStatistics?: string[]     

    /**
     * The unit used for these metrics
     */
    readonly unit: Unit;     

    /**
     * The period for the metrics
     */
    readonly period: Duration;     
     
    /**
     * The number of evaluation periods for latency and availabiltiy alarms
     */
    readonly evaluationPeriods: number       
    /**
     * The number of datapoints to alarm on for latency and availability alarms
     */
    readonly datapointsToAlarm: number

    /**
     * The threshold for alarms associated with success metrics, for example if measuring
     * success rate, the threshold may be 99, meaning you would want an alarm that triggers
     * if success drops below 99%.
     */
    readonly successAlarmThreshold: number   

    /**
     * The threshold for alarms associated with fault metrics, for example if measuring
     * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
     * if the fault rate goes above 1%.
     */

    readonly faultAlarmThreshold: number    

    /**
     * Gets the regional dimensions for these metrics, expected to return something
     * like {
     *   "Region": "us-east-1",
     *   "Operation": "Ride",
     *   "Service": "WildRydes"
     * }
     * @param region 
     */

    regionalDimensions(region: string): { [key: string]: string};
    
    /**
     * Gets the zonal dimensions for these metrics, expected to return something like 
     * {
     *   "Region": "us-east-1",
     *   "AZ-ID": "use1-az1",
     *   "Operation": "Ride",
     *   "Service": "WildRydes"
     * }
     * @param availabilityZoneId 
     * @param region 
     */
    zonalDimensions(availabilityZoneId: string, region: string): { [key: string]: string};
}