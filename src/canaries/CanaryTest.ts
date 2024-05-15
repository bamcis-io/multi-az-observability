import { Fn } from 'aws-cdk-lib';
import { IRule, Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { CanaryTestProps } from './props/CanaryTestProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { IAvailabilityZoneMapper } from '../azmapper/IAvailabilityZoneMapper';

export class CanaryTest extends Construct {
  timedEventRules: {[key: string]: IRule};

  metricNamespace: string;

  constructor(scope: Construct, id: string, props: CanaryTestProps) {
    super(scope, id);
    this.timedEventRules = {};

    let azMapper: IAvailabilityZoneMapper = new AvailabilityZoneMapper(this, 'AZMapper', {
      availabilityZoneNames: props.operation.service.availabilityZoneNames,
    });

    this.metricNamespace = props.operation.canaryMetricDetails ?
      props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails.metricNamespace : 'canary/metrics';

    props.operation.service.availabilityZoneNames.forEach((availabilityZoneName, index) => {

      let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
        availabilityZoneName.substring(availabilityZoneName.length - 1),
      );

      let scheme: string = props.operation.service.baseUrl.split(':')[0];
      let url: string = scheme + '://' + availabilityZoneName + '.' + props.loadBalancer.loadBalancerDnsName + props.operation.path;

      let data: {[key: string]: any} = {
        parameters: {
          methods: props.httpMethods !== undefined ? props.httpMethods : props.operation.httpMethods,
          url: url,
          postData: props.postData,
          headers: props.headers,
          operation: props.operation.operationName,
          faultBoundaryId: availabilityZoneId,
          faultBoundary: 'az',
          metricNamespace: this.metricNamespace,
          requestCount: props.requestCount,
        },
      };

      this.timedEventRules[availabilityZoneId] = new Rule(this, 'AZ' + index + props.operation.operationName + 'TimedEvent', {
        schedule: Schedule.expression(props.schedule),
        enabled: true,
        targets: [
          new LambdaFunction(props.function, { event: RuleTargetInput.fromObject(data) }),
        ],
      });
    });

    let data: {[key: string]: any} = {
      parameters: {
        methods: props.httpMethods !== undefined ? props.httpMethods : props.operation.httpMethods,
        url: props.operation.service.baseUrl.toString() + props.operation.path,
        postData: props.postData,
        headers: props.headers,
        operation: props.operation.operationName,
        faultBoundaryId: Fn.ref('AWS::Region'),
        faultBoundary: 'region',
        metricNamespace: props.operation.canaryMetricDetails?.canaryAvailabilityMetricDetails.metricNamespace,
        requestCount: props.requestCount,
      },
    };

    this.timedEventRules[Fn.ref('AWS::Region')] = new Rule(this, 'RegionalTimedEvent', {
      schedule: Schedule.expression(props.schedule),
      enabled: true,
      targets: [
        new LambdaFunction(props.function, { event: RuleTargetInput.fromObject(data) }),
      ],
    });
  }
}