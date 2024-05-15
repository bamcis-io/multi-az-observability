import { Duration, NestedStack } from 'aws-cdk-lib';
import { Dashboard, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { CanaryMetrics } from './CanaryMetrics';
import { IOperation } from './IOperation';
import { Operation } from './Operation';
import { OperationMetricDetails } from './OperationMetricDetails';
import { InstrumentedServiceMultiAZObservabilityProps } from './props/InstrumentedServiceMultiAZObservabilityProps';
import { MetricDimensions } from './props/MetricDimensions';
import { OperationAlarmsAndRules } from '../alarmsandrules/OperationAlarmsAndRules';
import { ServiceAlarmsAndRules } from '../alarmsandrules/ServiceAlarmsAndRules';
import { CanaryFunction } from '../canaries/CanaryFunction';
import { CanaryTest } from '../canaries/CanaryTest';
import { OperationAvailabilityAndLatencyDashboard } from '../dashboards/OperationAvailabilityAndLatencyDashboard';
import { ServiceAvailabilityAndLatencyDashboard } from '../dashboards/ServiceAvailabilityAndLatencyDashboard';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';
import { StackWithDynamicSource } from '../utilities/StackWithDynamicSource';

/**
 * An service that implements its own instrumentation to record
 * availability and latency metrics that can be used to create
 * alarms, rules, and dashboards from
 */
export class InstrumentedServiceMultiAZObservability extends Construct {
  /**
   * Key represents the operation name and the value is the set
   * of zonal alarms and rules for that operation. The values themselves
   * are dictionaries that have a key for each AZ ID.
   */
  readonly perOperationAlarmsAndRules: {[key: string]: OperationAlarmsAndRules};

  /**
   * The alarms and rules for the overall service
   */
  readonly serviceAlarms: ServiceAlarmsAndRules;

  /**
   * The dashboards for each operation
   */
  readonly operationDashboards: Dashboard[];

  /**
   * The service level dashboard
   */
  readonly serviceDashboard?: Dashboard;

  constructor(scope: Construct, id: string, props: InstrumentedServiceMultiAZObservabilityProps) {
    super(scope, id);
    this.operationDashboards = [];

    if (props.service.operations.filter(x => x.canaryTestProps !== undefined).length > 0) {

      let canaryStack: StackWithDynamicSource = new StackWithDynamicSource(this, 'CanaryStack', {
        assetsBucketsParameterName: props.assetsBucketParameterName,
        assetsBucketPrefixParameterName: props.assetsBucketPrefixParameterName,
      });

      let canary = new CanaryFunction(canaryStack, 'CanaryFunction', {});

      props.service.operations.forEach((operation, index) => {

        if (operation.canaryTestProps !== undefined) {
          let nestedStack: NestedStack = new NestedStack(this, operation.operationName + 'CanaryTestStack', {
          });

          let test = new CanaryTest(nestedStack, operation.operationName, {
            function: canary.function,
            requestCount: operation.canaryTestProps.requestCount,
            schedule: operation.canaryTestProps.schedule,
            operation: operation,
            loadBalancer: operation.canaryTestProps.loadBalancer,
            headers: operation.canaryTestProps.headers,
            postData: operation.canaryTestProps.postData,
          });

          let newOperation = new Operation({
            serverSideAvailabilityMetricDetails: operation.serverSideAvailabilityMetricDetails,
            serverSideLatencyMetricDetails: operation.serverSideLatencyMetricDetails,
            serverSideContributorInsightRuleDetails: operation.serverSideContributorInsightRuleDetails,
            service: operation.service,
            operationName: operation.operationName,
            path: operation.path,
            critical: operation.critical,
            httpMethods: operation.httpMethods,
            canaryMetricDetails: new CanaryMetrics({
              canaryAvailabilityMetricDetails: new OperationMetricDetails({
                operationName: operation.operationName,
                metricNamespace: test.metricNamespace,
                successMetricNames: ['Success'],
                faultMetricNames: ['Fault', 'Error'],
                alarmStatistic: operation.serverSideAvailabilityMetricDetails.alarmStatistic,
                unit: Unit.COUNT,
                period: operation.serverSideAvailabilityMetricDetails.period,
                evaluationPeriods: operation.serverSideAvailabilityMetricDetails.evaluationPeriods,
                datapointsToAlarm: operation.serverSideAvailabilityMetricDetails.datapointsToAlarm,
                successAlarmThreshold: operation.serverSideAvailabilityMetricDetails.successAlarmThreshold,
                faultAlarmThreshold: operation.serverSideAvailabilityMetricDetails.faultAlarmThreshold,
                graphedFaultStatistics: ['Sum'],
                graphedSuccessStatistics: ['Sum'],
                metricDimensions: new MetricDimensions({ Operation: operation.operationName }, 'AZ-ID', 'Region'),
              }),
              canaryLatencyMetricDetails: new OperationMetricDetails({
                operationName: operation.operationName,
                metricNamespace: test.metricNamespace,
                successMetricNames: ['SuccessLatency'],
                faultMetricNames: ['FaultLatency'],
                alarmStatistic: operation.serverSideLatencyMetricDetails.alarmStatistic,
                unit: Unit.MILLISECONDS,
                period: operation.serverSideLatencyMetricDetails.period,
                evaluationPeriods: operation.serverSideLatencyMetricDetails.evaluationPeriods,
                datapointsToAlarm: operation.serverSideLatencyMetricDetails.datapointsToAlarm,
                successAlarmThreshold: operation.serverSideLatencyMetricDetails.successAlarmThreshold,
                faultAlarmThreshold: operation.serverSideLatencyMetricDetails.faultAlarmThreshold,
                graphedFaultStatistics: operation.serverSideLatencyMetricDetails.graphedFaultStatistics,
                graphedSuccessStatistics: operation.serverSideLatencyMetricDetails.graphedSuccessStatistics,
                metricDimensions: new MetricDimensions({ Operation: operation.operationName }, 'AZ-ID', 'Region'),
              }),
              canaryContributorInsightRuleDetails: {
                logGroups: [canary.logGroup],
                successLatencyMetricJsonPath: '$.SuccessLatency',
                faultMetricJsonPath: '$.Faults',
                operationNameJsonPath: '$.Operation',
                instanceIdJsonPath: '$.InstanceId',
                availabilityZoneIdJsonPath: '$.AZ-ID',
              },
            }),
          });
          props.service.operations[index] = newOperation;
        }
      });
    }

    this.perOperationAlarmsAndRules = Object.fromEntries(props.service.operations.map((operation: IOperation) => {
      let nestedStack: NestedStack = new NestedStack(this, operation.operationName + 'OperationAlarmsAndRulesNestedStack');

      return [
        operation.operationName,
        new OperationAlarmsAndRules(nestedStack, operation.operationName, {
          operation: operation,
          outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
          outlierThreshold: props.outlierThreshold,
          loadBalancer: props.service.loadBalancer,
        }),
      ];
    },
    ));

    let serviceAlarmsStack: NestedStack = new NestedStack(this, 'ServiceAlarmsNestedStack');

    this.serviceAlarms = new ServiceAlarmsAndRules(serviceAlarmsStack, props.service.serviceName, {
      perOperationAlarmsAndRules: this.perOperationAlarmsAndRules,
      service: props.service,
    });

    if (props.createDashboards) {
      props.service.operations.forEach(x => {
        let dashboardStack: NestedStack = new NestedStack(this, x.operationName + 'Dashboard', {});

        this.operationDashboards.push(
          new OperationAvailabilityAndLatencyDashboard(dashboardStack, x.operationName, {
            operation: x,
            interval: props.interval ? props.interval : Duration.minutes(60),
            loadBalancer: props.service.loadBalancer,

            regionalEndpointCanaryAvailabilityAlarm:
              this.perOperationAlarmsAndRules[x.operationName].canaryRegionalAlarmsAndRules?.availabilityAlarm,
            regionalEndpointCanaryLatencyAlarm:
              this.perOperationAlarmsAndRules[x.operationName].canaryRegionalAlarmsAndRules?.latencyAlarm,

            regionalEndpointServerAvailabilityAlarm:
              this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.availabilityAlarm,
            regionalEndpointServerLatencyAlarm: this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.latencyAlarm,

            zonalEndpointCanaryAvailabilityAlarms:
              this.perOperationAlarmsAndRules[x.operationName].canaryZonalAlarmsAndRules.map(a => a.availabilityAlarm),
            zonalEndpointCanaryLatencyAlarms:
              this.perOperationAlarmsAndRules[x.operationName].canaryZonalAlarmsAndRules.map(a => a.latencyAlarm),

            zonalEndpointServerAvailabilityAlarms:
              this.perOperationAlarmsAndRules[x.operationName].serverSideZonalAlarmsAndRules.map(a => a.availabilityAlarm),
            zonalEndpointServerLatencyAlarms:
              this.perOperationAlarmsAndRules[x.operationName].serverSideZonalAlarmsAndRules.map(a => a.latencyAlarm),

            isolatedAZImpactAlarms:
              this.perOperationAlarmsAndRules[x.operationName].aggregateZonalAlarms,
            regionalImpactAlarm:
              this.perOperationAlarmsAndRules[x.operationName].aggregateRegionalAlarm,
            instanceContributorsToFaults:
              this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalFaults,
            instanceContributorsToHighLatency:
              this.perOperationAlarmsAndRules[x.operationName].serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalHighLatency,

          }).dashboard,
        );
      });

      let dashboardStack: NestedStack = new NestedStack(this, 'ServiceDashboardStack', {});

      this.serviceDashboard = new ServiceAvailabilityAndLatencyDashboard(dashboardStack, props.service.serviceName, {
        interval: props.interval ? props.interval : Duration.minutes(60),
        service: props.service,
        aggregateRegionalAlarm: this.serviceAlarms.regionalFaultCountServerSideAlarm,
        zonalAggregateAlarms: this.serviceAlarms.zonalAggregateIsolatedImpactAlarms,
      }).dashboard;
    }
  }
}