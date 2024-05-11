import * as path from 'path';
import { Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { ISecurityGroup, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Effect, IManagedPolicy, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, AssetCode, Code, Function, IFunction, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { ICanaryFunction } from './ICanaryFunction';
import { CanaryFunctionProps } from './props/CanaryFunctionProps';

export class CanaryFunction extends Construct implements ICanaryFunction {
  /**
     * The canary function
     */
  function: IFunction;

  /**
     * The log group where the canarty logs will be sent
     */
  logGroup: ILogGroup;

  constructor(scope: Construct, id: string, props: CanaryFunctionProps) {
    super(scope, id);

    let xrayManagedPolicy: IManagedPolicy = new ManagedPolicy(this, 'xrayManagedPolicy', {
      path: '/canary/',
      statements: [
        new PolicyStatement({
          actions: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
            'xray:GetSamplingRules',
            'xray:GetSamplingTargets',
            'xray:GetSamplingStatisticSummaries',
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    });
    let ec2ManagedPolicy = new ManagedPolicy(this, 'ec2ManagedPolicy', {
      path: '/canary/',
      statements: [
        new PolicyStatement({
          actions: [
            'ec2:CreateNetworkInterface',
            'ec2:DescribeNetworkInterfaces',
            'ec2:DeleteNetworkInterface',
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    });

    let executionRole: IRole = new Role(this, 'executionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      path: '/canary/',
      managedPolicies: [
        xrayManagedPolicy,
        ec2ManagedPolicy,
      ],
    });

    const dir: string = path.resolve(__dirname, './src');
    let code: AssetCode = Code.fromAsset(dir, {
      bundling: {
        //image: new Runtime('python3.12:latest-arm64', RuntimeFamily.PYTHON).bundlingImage,
        image: Runtime.PYTHON_3_12.bundlingImage,
        command: [
          'bash', '-c',
          'pip install --no-cache -r requirements.txt -t /asset-output && cp --archive --update . /asset-output',
        ],
        platform: 'linux/arm64',
      },
    });

    if (props.vpc !== undefined && props.vpc != null) {
      let sg: ISecurityGroup = new SecurityGroup(this, 'canarySecurityGroup', {
        description: 'Allow canary to communicate with load balancer',
        vpc: props.vpc,
      });

      this.function = new Function(this, 'canary', {
        runtime: Runtime.PYTHON_3_12,
        code: code,
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(240),
        memorySize: 512,
        environment: {
          REGION: Fn.ref('AWS::Region'),
          PARTITION: Fn.ref('AWS::Partition'),
          TIMEOUT: props.httpTimeout !== undefined ? props.httpTimeout.toSeconds().toString() : '2',
          IGNORE_SSL_ERRORS: (props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true).toString().toLowerCase(),
        },
        vpc: props.vpc,
        securityGroups: [sg],
        vpcSubnets: props.subnetSelect,
      });
    } else {
      this.function = new Function(this, 'canary', {
        runtime: Runtime.PYTHON_3_12,
        code: code,
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(240),
        memorySize: 512,
        environment: {
          REGION: Fn.ref('AWS::Region'),
          PARTITION: Fn.ref('AWS::Partition'),
          TIMEOUT: props.httpTimeout !== undefined ? props.httpTimeout.toSeconds().toString() : '2',
          IGNORE_SSL_ERRORS: (props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true).toString().toLowerCase(),
        },
      });
    }

    this.function.addPermission('invokePermission', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal('events.amazonaws.com'),
      sourceArn: Fn.sub('arn:${AWS::Partition}:events:${AWS::Region}:${AWS::AccountId}:rule/*'),
    });

    this.logGroup = new LogGroup(this, 'logGroup', {
      logGroupName: `/aws/lambda/${this.function.functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new ManagedPolicy(this, 'cwManagedPolicy', {
      path: '/canary/',
      statements: [
        new PolicyStatement({
          actions: [
            'cloudwatch:PutMetricData',
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: [
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          effect: Effect.ALLOW,
          resources: [
            this.logGroup.logGroupArn,
          ],
        }),
      ],
      roles: [executionRole],
    });
  }
}
