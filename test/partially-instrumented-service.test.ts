import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { MultiAvailabilityZoneObservability } from '../src/MultiAvailabilityZoneObservability';
import { IOperation } from '../src/services/IOperation';
import { IService } from '../src/services/IService';
import { Operation } from '../src/services/Operation';
import { OperationMetricDetails } from '../src/services/OperationMetricDetails';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Service } from '../src/services/Service';

test('Partially instrumented service', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
  ];

  let vpc = new Vpc(stack, 'vpc', {
    availabilityZones: azs,
    subnetConfiguration: [
      {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        name: 'private_with_egress_subnets',
        cidrMask: 24,
      },
    ],
    createInternetGateway: false,
    natGateways: 0,
  });


  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(stack, 'alb', {
    vpc: vpc,
    crossZoneEnabled: false,
    vpcSubnets: subnets,
  });

  let service: IService = new Service({
    serviceName: 'test',
    availabilityZoneNames: vpc.availabilityZones,
    baseUrl: 'http://www.example.com',
    faultCountThreshold: 25,
    period: Duration.seconds(60),
    loadBalancer: loadBalancer,
  });

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
    serverSideAvailabilityMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['Success'],
      faultMetricNames: ['Fault', 'Error'],
      alarmStatistic: 'Sum',
      unit: Unit.COUNT,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 99.9,
      faultAlarmThreshold: 0.1,
      graphedFaultStatistics: ['Sum'],
      graphedSuccessStatistics: ['Sum'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    serverSideLatencyMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['SuccessLatency'],
      faultMetricNames: ['FaultLatency'],
      alarmStatistic: 'p99',
      unit: Unit.MILLISECONDS,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 100,
      faultAlarmThreshold: 1,
      graphedFaultStatistics: ['p99'],
      graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
  });

  service.addOperation(rideOperation);

  new MultiAvailabilityZoneObservability(stack, 'MAZObservability', {
    instrumentedServiceObservabilityProps: {
      createDashboards: false,
      service: service,
      outlierThreshold: 0.7,
      interval: Duration.minutes(30),
    },
  });

  Template.fromStack(stack);
});

/*
test('Partially instrumented service adds canaries', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
  ];

  let vpc = new Vpc(stack, 'vpc', {
    availabilityZones: azs,
    subnetConfiguration: [
      {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        name: 'private_with_egress_subnets',
        cidrMask: 24,
      },
    ],
    createInternetGateway: false,
    natGateways: 0,
  });


  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(stack, 'alb', {
    vpc: vpc,
    crossZoneEnabled: false,
    vpcSubnets: subnets,
  });

  let service: IService = new Service({
    serviceName: 'test',
    availabilityZoneNames: vpc.availabilityZones,
    baseUrl: 'http://www.example.com',
    faultCountThreshold: 25,
    period: Duration.seconds(60),
    loadBalancer: loadBalancer,
  });

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
    serverSideAvailabilityMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['Success'],
      faultMetricNames: ['Fault', 'Error'],
      alarmStatistic: 'Sum',
      unit: Unit.COUNT,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 99.9,
      faultAlarmThreshold: 0.1,
      graphedFaultStatistics: ['Sum'],
      graphedSuccessStatistics: ['Sum'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    serverSideLatencyMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['SuccessLatency'],
      faultMetricNames: ['FaultLatency'],
      alarmStatistic: 'p99',
      unit: Unit.MILLISECONDS,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 100,
      faultAlarmThreshold: 1,
      graphedFaultStatistics: ['p99'],
      graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    canaryTestProps: {
      requestCount: 10,
      schedule: 'rate(1 minute)',
      loadBalancer: loadBalancer,
    },
  });

  service.addOperation(rideOperation);

  new MultiAvailabilityZoneObservability(stack, 'MAZObservability', {
    instrumentedServiceObservabilityProps: {
      createDashboards: false,
      service: service,
      outlierThreshold: 0.7,
      interval: Duration.minutes(30),
    },
  });

  Template.fromStack(stack);
});
*/

test('Partially instrumented service with canaries', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
  ];

  let vpc = new Vpc(stack, 'vpc', {
    availabilityZones: azs,
    subnetConfiguration: [
      {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        name: 'private_with_egress_subnets',
        cidrMask: 24,
      },
    ],
    createInternetGateway: false,
    natGateways: 0,
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(stack, 'alb', {
    vpc: vpc,
    crossZoneEnabled: false,
    vpcSubnets: subnets,
  });

  let service: IService = new Service({
    serviceName: 'test',
    availabilityZoneNames: vpc.availabilityZones,
    baseUrl: 'http://www.example.com',
    faultCountThreshold: 25,
    period: Duration.seconds(60),
    loadBalancer: loadBalancer,
  });

  let rideOperation: Operation = {
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
    serverSideAvailabilityMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['Success'],
      faultMetricNames: ['Fault', 'Error'],
      alarmStatistic: 'Sum',
      unit: Unit.COUNT,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 99.9,
      faultAlarmThreshold: 0.1,
      graphedFaultStatistics: ['Sum'],
      graphedSuccessStatistics: ['Sum'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    serverSideLatencyMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['SuccessLatency'],
      faultMetricNames: ['FaultLatency'],
      alarmStatistic: 'p99',
      unit: Unit.MILLISECONDS,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 100,
      faultAlarmThreshold: 1,
      graphedFaultStatistics: ['p99'],
      graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    canaryMetricDetails: {
      canaryAvailabilityMetricDetails: new OperationMetricDetails({
        operationName: 'ride',
        metricNamespace: 'front-end/metrics',
        successMetricNames: ['Success'],
        faultMetricNames: ['Fault', 'Error'],
        alarmStatistic: 'Sum',
        unit: Unit.COUNT,
        period: Duration.seconds(60),
        evaluationPeriods: 5,
        datapointsToAlarm: 3,
        successAlarmThreshold: 99.9,
        faultAlarmThreshold: 0.1,
        graphedFaultStatistics: ['Sum'],
        graphedSuccessStatistics: ['Sum'],
        metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
      }),
      canaryLatencyMetricDetails: new OperationMetricDetails({
        operationName: 'ride',
        metricNamespace: 'front-end/metrics',
        successMetricNames: ['SuccessLatency'],
        faultMetricNames: ['FaultLatency'],
        alarmStatistic: 'p99',
        unit: Unit.MILLISECONDS,
        period: Duration.seconds(60),
        evaluationPeriods: 5,
        datapointsToAlarm: 3,
        successAlarmThreshold: 100,
        faultAlarmThreshold: 1,
        graphedFaultStatistics: ['p99'],
        graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
        metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
      }),
    },
  };

  service.addOperation(rideOperation);

  new MultiAvailabilityZoneObservability(stack, 'MAZObservability', {
    instrumentedServiceObservabilityProps: {
      createDashboards: true,
      service: service,
      outlierThreshold: 0.7,
      interval: Duration.minutes(30),
    },
  });

  Template.fromStack(stack);
});