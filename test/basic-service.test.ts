import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CfnNatGateway, SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { BasicServiceMultiAZObservability } from '../src/services/BasicServiceMultiAZObservability';
import { OutlierDetectionAlgorithm } from '../src/utilities/OutlierDetectionAlgorithm';

test('Basic service observability', () => {
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

  let natGateways: {[key: string]: CfnNatGateway[]} = {};

  subnets.subnets.forEach((subnet, index) => {
    let az = subnet.availabilityZone;
    let subnetId = subnet.subnetId;

    natGateways[az] = [
      new CfnNatGateway(stack, 'AZ' + index + 'NatGateway', {
        subnetId: subnetId,
      }),
    ];
  });

  new BasicServiceMultiAZObservability(stack, 'MAZObservability', {
    applicationLoadBalancers: [
      new ApplicationLoadBalancer(stack, 'alb', {
        vpc: vpc,
        crossZoneEnabled: false,
      }),
    ],
    natGateways: natGateways,
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
    outlierThreshold: 0.7,
    faultCountPercentageThreshold: 1.0,
    packetLossImpactPercentageThreshold: 0.01,
    serviceName: 'test',
    period: cdk.Duration.seconds(60),
    createDashboard: true,
  });

  Template.fromStack(stack);
});