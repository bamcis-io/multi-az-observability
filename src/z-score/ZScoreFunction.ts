import * as path from 'path';
import { Duration, Fn, RemovalPolicy, Tags } from 'aws-cdk-lib';
import { ISecurityGroup, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Effect, IManagedPolicy, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, IFunction, ILayerVersion, LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { IZScoreFunction } from './IZScoreFunction';
import { ZScoreFunctionProps } from './props/ZScoreFunctionProps';

export class ZScoreFunction extends Construct implements IZScoreFunction {
  /**
     * The z-score function
     */
  function: IFunction;

  /**
     * The log group where the canarty logs will be sent
     */
  logGroup: ILogGroup;

  constructor(scope: Construct, id: string, props: ZScoreFunctionProps) {
    super(scope, id);

    let xrayManagedPolicy: IManagedPolicy = new ManagedPolicy(this, 'xrayManagedPolicy', {
      path: '/z-score/',
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
    let cwManagedPolicy = new ManagedPolicy(this, 'CWManagedPolicy', {
      path: '/z-score/',
      statements: [
        new PolicyStatement({
          actions: [
            'cloudwatch:GetMetricData',
            'cloduwatch:PutMetricData',
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    });

    let executionRole: IRole = new Role(this, 'executionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      path: '/z-score/',
      managedPolicies: [
        xrayManagedPolicy,
        cwManagedPolicy,
      ],
    });

    let layer: ILayerVersion = new LayerVersion(this, 'NumPyLayer', {
      code: Code.fromAsset(path.join(__dirname, 'src/numpy-layer.zip')),
      compatibleArchitectures: [
        Architecture.ARM_64,
      ],
      compatibleRuntimes: [
        Runtime.PYTHON_3_12,
      ],
    });

    if (props.vpc !== undefined && props.vpc != null) {
      let sg: ISecurityGroup = new SecurityGroup(this, 'ZScoreSecurityGroup', {
        description: 'Allow z-score function to communicate with CW',
        vpc: props.vpc,
        allowAllOutbound: true,
      });

      this.function = new Function(this, 'ZScore', {
        runtime: Runtime.PYTHON_3_12,
        code: Code.fromAsset(path.join(__dirname, 'src/z-score.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(5),
        memorySize: 512,
        layers: [
          layer,
        ],
        environment: {
          REGION: Fn.ref('AWS::Region'),
          PARTITION: Fn.ref('AWS::Partition'),
        },
        vpc: props.vpc,
        securityGroups: [sg],
        vpcSubnets: props.subnetSelection,
      });
    } else {
      this.function = new Function(this, 'ZScore', {
        runtime: Runtime.PYTHON_3_12,
        code: Code.fromAsset(path.join(__dirname, 'src/z-score.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(5),
        memorySize: 512,
        layers: [
          layer,
        ],
        environment: {
          REGION: Fn.ref('AWS::Region'),
          PARTITION: Fn.ref('AWS::Partition'),
        },
      });
    }

    Tags.of(this.function).add('cloudwatch:datasource', 'custom', {
      includeResourceTypes: ['AWS::Lambda::Function'],
    });

    this.function.addPermission('invokePermission', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal('lambda.datasource.cloudwatch.amazonaws.com'),
      sourceAccount: Fn.ref('AWS::AccountId'),
    });

    this.logGroup = new LogGroup(this, 'logGroup', {
      logGroupName: `/aws/lambda/${this.function.functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new ManagedPolicy(this, 'cwLogsManagedPolicy', {
      path: '/z-score/',
      statements: [
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
