import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ILogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { InstrumentedServiceMultiAZObservability } from '../src/services/InstrumentedServiceMultiAZObservability';
import { IService } from '../src/services/IService';
import { Operation } from '../src/services/Operation';
import { OperationMetricDetails } from '../src/services/OperationMetricDetails';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Service } from '../src/services/Service';
import { ServiceMetricDetails } from '../src/services/ServiceMetricDetails';


const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack', {
  stackName: 'test-stack',
  //synthesizer: new cdk.DefaultStackSynthesizer({
  //  fileAssetsBucketName: "${AssetsBucket}",
  //  bucketPrefix: "${AssetsBucketPrefix}"
  //})
});
/*new cdk.CfnParameter(stack, 'AssetsBucket', {
  type: 'string',
  default: '{{.AssetsBucket}}',
});
new cdk.CfnParameter(stack, 'AssetsBucketPrefix', {
  type: 'string',
  default: '{{.AssetsBucketPrefix}}',
});*/
let azs: string[] = [
  cdk.Fn.ref('AWS::Region') + 'a',
  cdk.Fn.ref('AWS::Region') + 'b',
  cdk.Fn.ref('AWS::Region') + 'c',
];

let vpc = new Vpc(stack, 'vpc', {
  availabilityZones: azs,
  subnetConfiguration: [
    {
      subnetType: SubnetType.PRIVATE_ISOLATED,
      name: 'private_isolated_subnets',
      cidrMask: 24,
    },
  ],
  createInternetGateway: false,
  natGateways: 0,
  restrictDefaultSecurityGroup: false,
});

let subnets: SelectedSubnets = vpc.selectSubnets({
  subnetType: SubnetType.PRIVATE_ISOLATED,
});

let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(stack, 'alb', {
  vpc: vpc,
  crossZoneEnabled: false,
  vpcSubnets: subnets,
});

let logGroup: ILogGroup = new LogGroup(stack, 'Logs', {
});

let service: IService = new Service({
  serviceName: 'test',
  availabilityZoneNames: vpc.availabilityZones,
  baseUrl: 'http://www.example.com',
  faultCountThreshold: 25,
  period: Duration.seconds(60),
  loadBalancer: loadBalancer,
  defaultAvailabilityMetricDetails: new ServiceMetricDetails({
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
  }),
  defaultLatencyMetricDetails: new ServiceMetricDetails({
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
  }),
  canaryTestProps: {
    requestCount: 10,
    schedule: 'rate(1 minute)',
    loadBalancer: loadBalancer,
    networkConfiguration: {
      vpc: vpc,
      subnetSelection: { subnetType: SubnetType.PRIVATE_ISOLATED },
    },
  },
  defaultContributorInsightRuleDetails: {
    logGroups: [logGroup],
    successLatencyMetricJsonPath: '$.SuccessLatency',
    faultMetricJsonPath: '$.Faults',
    operationNameJsonPath: '$.Operation',
    instanceIdJsonPath: '$.InstanceId',
    availabilityZoneIdJsonPath: '$.AZ-ID',
  },
});

let rideOperation: Operation = {
  operationName: 'ride',
  service: service,
  path: '/ride',
  critical: true,
  httpMethods: ['GET'],
  serverSideContributorInsightRuleDetails: {
    logGroups: [logGroup],
    successLatencyMetricJsonPath: '$.SuccessLatency',
    faultMetricJsonPath: '$.Faults',
    operationNameJsonPath: '$.Operation',
    instanceIdJsonPath: '$.InstanceId',
    availabilityZoneIdJsonPath: '$.AZ-ID',
  },
  serverSideAvailabilityMetricDetails: new OperationMetricDetails({
    operationName: 'ride',
    metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
  }, service.defaultAvailabilityMetricDetails),
  serverSideLatencyMetricDetails: new OperationMetricDetails({
    operationName: 'ride',
    metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
  }, service.defaultLatencyMetricDetails),
};
let payOperation: Operation = {
  operationName: 'pay',
  service: service,
  path: '/pay',
  critical: true,
  httpMethods: ['GET'],
  serverSideAvailabilityMetricDetails: new OperationMetricDetails({
    operationName: 'pay',
    metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
  }, service.defaultAvailabilityMetricDetails),
  serverSideLatencyMetricDetails: new OperationMetricDetails({
    operationName: 'pay',
    metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
  }, service.defaultLatencyMetricDetails),
};

service.addOperation(rideOperation);
service.addOperation(payOperation);

new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
  createDashboards: true,
  service: service,
  outlierThreshold: 0.7,
  interval: Duration.minutes(30),
  assetsBucketParameterName: 'AssetsBucket',
  assetsBucketPrefixParameterName: 'AssetsBucketPrefix',
});
app.synth();