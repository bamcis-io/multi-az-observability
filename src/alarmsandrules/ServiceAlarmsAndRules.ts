import { Construct } from "constructs";
import { IOperationAlarmsAndRules } from "./IOperationAlarmsAndRules";
import { IService } from "../IService";
import { IServiceAlarmsAndRules } from "./IServiceAlarmsAndRules";
import { IServiceAlarmsAndRulesProps } from "./props/IServiceAlarmsAndRulesProps";
import { Alarm, AlarmRule, ComparisonOperator, CompositeAlarm, IAlarm, IMetric, MathExpression } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityAndLatencyMetrics } from "../metrics/AvailabilityAndLatencyMetrics";
import { RegionalAvailabilityMetricProps } from "../metrics/props/RegionalAvailabilityMetricProps";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { IRegionalAvailabilityMetricProps } from "../metrics/props/IRegionalAvailabilityMetricProps";
import { Fn } from "aws-cdk-lib";

/**
 * Service level alarms and rules using critical operations
 */
export class ServiceAlarmsAndRules extends Construct implements IServiceAlarmsAndRules
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

    constructor(scope: Construct, id: string, props: IServiceAlarmsAndRulesProps)
    {
        super(scope, id);
        this.service = props.service;

        let criticalOperations: string[] = props.service.criticalOperations.map(x => x.operationName);
        let counter: number = 1;
        this.zonalAggregateIsolatedImpactAlarms = [];
       
        for (let i = 0; i < props.service.azCount; i++)
        {
            let availabilityZonedId: string = props.service.GetAvailabilityZoneIdAtIndex(i);

            this.zonalAggregateIsolatedImpactAlarms.push(new CompositeAlarm(this, "AZ" + counter + "ServiceAggregateIsolatedImpactAlarm", {
                compositeAlarmName: availabilityZonedId + "-" + props.service.serviceName.toLowerCase() + "-isolated-impact-aggregate-alarm",
                alarmRule: AlarmRule.anyOf(...Object.values(Object.entries(props.perOperationAlarmsAndRules)
                    .reduce((filtered, [key, value]) => {
                        if (criticalOperations.indexOf(key) > -1)
                        {
                            filtered[key] = value;
                        }

                        return filtered;
                    }, {} as {[key: string]: IOperationAlarmsAndRules})
                )
                .map(x => x.aggregateZonalAlarms[i]))
            }));

            counter++;
        }

        let key: string = "a";
        let keyCounter: number = 1;

        let regionalOperationFaultCountMetrics: {[key: string]: IMetric} = {};

        props.service.criticalOperations.forEach(x => {
            let tmp: string = `${key}${keyCounter++}`

            let metricProps: IRegionalAvailabilityMetricProps = new RegionalAvailabilityMetricProps();
            metricProps.label = x.operationName + " fault count";
            metricProps.metricDetails = x.serverSideAvailabilityMetricDetails;
            metricProps.metricType = AvailabilityMetricType.FAULT_COUNT;

            regionalOperationFaultCountMetrics[key] = AvailabilityAndLatencyMetrics.createRegionalAvailabilityMetric(metricProps);
        });

        let regionalFaultCount: IMetric = new MathExpression({
            usingMetrics: regionalOperationFaultCountMetrics,
            expression: Object.keys(regionalOperationFaultCountMetrics).join("+"),
            label: props.service.serviceName + " fault count",
            period: props.service.period
        });

        this.regionalFaultCountServerSideAlarm = new Alarm(this, "RegionalFaultCount", {
            alarmName: Fn.ref("AWS::Region") + "-" + props.service.serviceName.toLowerCase() + "-fault-count",
            datapointsToAlarm: 3,
            evaluationPeriods: 5,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            threshold: props.service.faultCountThreshold,
            alarmDescription: "Counts faults from all critical operation in the service",
            metric: regionalFaultCount
        });

        this.regionalAvailabilityCanaryAlarm = new CompositeAlarm(this, "ServiceCanaryAggregateIsolatedImpactAlarm", {
            compositeAlarmName: Fn.ref("AWS::Region") + "-" + props.service.serviceName.toLowerCase() + "-canary-aggregate-alarm",
            alarmRule: AlarmRule.anyOf(...Object.values(Object.entries(props.perOperationAlarmsAndRules)
                .reduce((filtered, [key, value]) => {
                    if (criticalOperations.indexOf(key) > -1)
                    {
                        filtered[key] = value;
                    }

                    return filtered;
                }, {} as {[key: string]: IOperationAlarmsAndRules})
            )
            .map(x => x.canaryRegionalAlarmsAndRules)
            .map(x => x.availabilityOrLatencyAlarm)
            )
        });

        this.regionalAvailabilityServerSideAlarm = new CompositeAlarm(this, "ServiceServerSideAggregateIsolatedImpactAlarm", {
            compositeAlarmName: Fn.ref("AWS::Region") + "-" + props.service.serviceName.toLowerCase() + "-server-side-aggregate-alarm",
            alarmRule: AlarmRule.anyOf(...Object.values(Object.entries(props.perOperationAlarmsAndRules)
                .reduce((filtered, [key, value]) => {
                    if (criticalOperations.indexOf(key) > -1)
                    {
                        filtered[key] = value;
                    }

                    return filtered;
                }, {} as {[key: string]: IOperationAlarmsAndRules})
            )
            .map(x => x.serverSideRegionalAlarmsAndRules)
            .map(x => x.availabilityOrLatencyAlarm)
            )
        });
    }
}