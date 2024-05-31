import { Duration, Fn } from 'aws-cdk-lib';
import { IMetric, Metric, MathExpression, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityMetricProps } from './props/AvailabilityMetricProps';
import { LatencyMetricProps } from './props/LatencyMetricProps';
import { RegionalAvailabilityMetricProps } from './props/RegionalAvailabilityMetricProps';
import { RegionalLatencyMetricProps } from './props/RegionalLatencyMetricProps';
import { ServiceAvailabilityMetricProps } from './props/ServiceAvailabilityMetricProps';
import { ServiceLatencyMetricProps } from './props/ServiceLatencyMericProps';
import { ZonalAvailabilityMetricProps } from './props/ZonalAvailabilityMetricProps';
import { ZonalLatencyMetricProps } from './props/ZonalLatencyMetricProps';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';

/**
 * Class for creating availability and latency metrics that can be used in alarms and graphs
 */
export class AvailabilityAndLatencyMetrics {

  /**
       * Creates a zonal latency metric
       * @param props
       * @returns
       */
  static createZonalLatencyMetrics(props: ZonalLatencyMetricProps): IMetric[] {
    return this.createLatencyMetrics(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, Fn.ref('AWS::Region')));
  }

  /**
       * Creates an average zonal latency metric
       * @param props
       * @returns
       */
  static createZonalAverageLatencyMetric(props: ZonalLatencyMetricProps): IMetric {
    return this.createAverageLatencyMetric(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, Fn.ref('AWS::Region')));
  }

  /**
       * Creates a count of high latency metric
       * @param props
       * @returns
       */
  static createZonalCountLatencyMetric(props: ZonalLatencyMetricProps): IMetric {

    let metrics: IMetric[] = this.createLatencyMetrics(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, Fn.ref('AWS::Region')));

    let usingMetrics: { [key: string]: IMetric } = {};

    metrics.forEach((metric: IMetric, index: number) => {
      let keyPrefix: string = ((props.keyPrefix === undefined || props.keyPrefix == '') ? '' : props.keyPrefix.toLowerCase() + '_') +
            props.metricDetails.operationName.toLowerCase() + '_' +
            props.metricType.toString().toLowerCase();

      usingMetrics[keyPrefix + index] = metric;
    });

    return new MathExpression({
      expression: Object.keys(metrics).join('+'),
      label: props.label,
      period: props.metricDetails.period,
      usingMetrics: usingMetrics,
    });
  }

  /**
       * Creates a regional latency metric
       * @param props
       * @returns
       */
  static createRegionalLatencyMetrics(props: RegionalLatencyMetricProps): IMetric[] {
    return this.createLatencyMetrics(props, props.metricDetails.metricDimensions.regionalDimensions(Fn.ref('AWS::Region')));
  }

  /**
       * Creates a regional average latency metric
       * @param props
       * @returns
       */
  static createRegionalAverageLatencyMetric(props: RegionalLatencyMetricProps): IMetric {
    return this.createAverageLatencyMetric(props, props.metricDetails.metricDimensions.regionalDimensions(Fn.ref('AWS::Region')));
  }

  /**
       * Creates a count of high latency metric
       * @param props
       * @returns
       */
  static createRegionalCountLatencyMetric(props: RegionalLatencyMetricProps): IMetric {

    let metrics: IMetric[] = this.createLatencyMetrics(props, props.metricDetails.metricDimensions.regionalDimensions(Fn.ref('AWS::Region')));

    let usingMetrics: { [key: string]: IMetric } = {};

    metrics.forEach((metric: IMetric, index: number) => {
      let keyPrefix: string = ((props.keyPrefix === undefined || props.keyPrefix == '') ? '' : props.keyPrefix.toLowerCase() + '_') +
            props.metricDetails.operationName.toLowerCase() + '_' +
            props.metricType.toString().toLowerCase();

      usingMetrics[keyPrefix + index] = metric;
    });

    return new MathExpression({
      expression: Object.keys(metrics).join('+'),
      label: props.label,
      period: props.metricDetails.period,
      usingMetrics: usingMetrics,
    });
  }

  /**
       * Creates a regional service level availability metrics, one metric for
       * each operation at the regional level and the service.
       * @param props
       * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
       * are the metrics for each operation included in the request availability metric props.
       */
  static createRegionalServiceAvailabilityMetrics(props: ServiceAvailabilityMetricProps): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let counter: number = 0;

    props.availabilityMetricProps.forEach(prop => {

      let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == '') ? '' : prop.keyPrefix.toLowerCase() + '_') +
                //prop.metricDetails.service.serviceName.toLowerCase() + "_" +
                prop.metricDetails.operationName.toLowerCase() + '_' +
                prop.metricType.toString().toLowerCase();

      let regionalOperationAvailabilityMetric: IMetric = this.createRegionalAvailabilityMetric(prop as RegionalAvailabilityMetricProps);

      operationMetrics.push(regionalOperationAvailabilityMetric);
      usingMetrics[`${keyPrefix}${counter++}`] = regionalOperationAvailabilityMetric;
    });

    let expression: string = '';

    switch (props.availabilityMetricProps[0].metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
    }

    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: props.period,
      label: props.label,
      expression: expression,
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }

  /**
     * Creates a count of high latency responses for all critical operations
     * @param props
     * @returns
     */
  static createRegionalServiceLatencyMetrics(props: ServiceLatencyMetricProps): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let counter: number = 0;
    let internalKeyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');

    props.latencyMetricProps.forEach(prop => {

      let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == '') ? '' : prop.keyPrefix.toLowerCase() + '_') +
                prop.metricDetails.operationName.toLowerCase() + '_' +
                prop.metricType.toString().toLowerCase();

      let regionalOperationLatencyMetrics: IMetric[] = this.createRegionalLatencyMetrics(prop as RegionalLatencyMetricProps);

      let metrics: {[key: string]: IMetric} = {};

      regionalOperationLatencyMetrics.forEach((metric: IMetric, index: number) => {
        metrics[internalKeyPrefix + index] = metric;
      });

      internalKeyPrefix = AvailabilityAndLatencyMetrics.nextChar(internalKeyPrefix);

      let regionalOperationLatencyMetric: IMetric = new MathExpression({
        expression: Object.keys(metrics).join('+'),
        label: props.label,
        period: props.period,
        usingMetrics: metrics,
      });

      operationMetrics.push(regionalOperationLatencyMetric);
      usingMetrics[`${keyPrefix}${counter++}`] = regionalOperationLatencyMetric;
    });

    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: props.period,
      label: props.label,
      expression: Object.keys(usingMetrics).join('+'),
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }

  /**
       * Creates a zonal service level availability metrics, one metric for
       * each operation at the zonal level and the service.
       * @param props
       * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
       * are the metrics for each operation included in the request availability metric props.
       */
  static createZonalServiceAvailabilityMetrics(props: ServiceAvailabilityMetricProps): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let counter: number = 0;

    props.availabilityMetricProps.forEach(prop => {

      let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == '') ? '' : prop.keyPrefix.toLowerCase() + '_') +
                prop.metricDetails.operationName.toLowerCase() + '_' +
                prop.metricType.toString().toLowerCase();

      let zonalOperationAvailabilityMetric: IMetric = this.createZonalAvailabilityMetric(prop as ZonalAvailabilityMetricProps);

      operationMetrics.push(zonalOperationAvailabilityMetric);
      usingMetrics[`${keyPrefix}${counter++}`] = zonalOperationAvailabilityMetric;
    });

    let expression: string = '';

    switch (props.availabilityMetricProps[0].metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
    }
    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: props.period,
      label: props.label,
      expression: expression,
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }

  static createZonalServiceLatencyMetrics(props: ServiceLatencyMetricProps): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let counter: number = 0;
    let internalKeyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');

    props.latencyMetricProps.forEach(prop => {

      let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == '') ? '' : prop.keyPrefix.toLowerCase() + '_') +
                prop.metricDetails.operationName.toLowerCase() + '_' +
                prop.metricType.toString().toLowerCase();

      let zonalOperationLatencyMetrics: IMetric[] = this.createZonalLatencyMetrics(prop as ZonalLatencyMetricProps);

      let metrics: {[key: string]: IMetric} = {};

      zonalOperationLatencyMetrics.forEach((metric: IMetric, index: number) => {
        metrics[internalKeyPrefix + index] = metric;
      });

      internalKeyPrefix = AvailabilityAndLatencyMetrics.nextChar(internalKeyPrefix);

      let zonalOperationLatencyMetric: IMetric = new MathExpression({
        expression: Object.keys(metrics).join('+'),
        label: props.label,
        period: props.period,
        usingMetrics: metrics,
      });

      operationMetrics.push(zonalOperationLatencyMetric);
      usingMetrics[`${keyPrefix}${counter++}`] = zonalOperationLatencyMetric;
    });

    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: props.period,
      label: props.label,
      expression: Object.keys(usingMetrics).join('+'),
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }

  /**
       * Creates a zonal availability metric
       * @param props
       * @returns
       */
  static createZonalAvailabilityMetric(props: ZonalAvailabilityMetricProps): IMetric {
    return this.createAvailabilityMetric(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, Fn.ref('AWS::Region')));
  }

  /**
       * Creates a regional availability metric
       * @param props
       * @returns
       */
  static createRegionalAvailabilityMetric(props: RegionalAvailabilityMetricProps): IMetric {
    return this.createAvailabilityMetric(props, props.metricDetails.metricDimensions.regionalDimensions(Fn.ref('AWS::Region')));
  }

  /**
       * Creates a regional fault count metric using 5xx target and load balancer
       * metrics against total requests for the specified load balancer
       * @param period
       * @param loadBalancerFullName
       * @returns
       */
  static createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName: string, period: Duration): IMetric {
    return new MathExpression({
      expression: '((m1 + m2) / m3) * 100',
      label: 'Fault Rate',
      period: period,
      usingMetrics: {
        m1: new Metric({
          metricName: 'HTTPCode_Target_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: '5xxTarget',
        }),
        m2: new Metric({
          metricName: 'HTTPCode_ELB_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: '5xxELB',
        }),
        m3: new Metric({
          metricName: 'RequestCount',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: 'Requests',
        }),
      },
    });
  }

  /**
       * Creates a zonal fault count metric using 5xx target and load balancer
       * metrics against total requests for the specified load balancer
       * @param loadBalancerFullName
       * @param availabilityZoneName
       * @param period
       * @returns
       */
  static createZonalApplicationLoadBalancerFaultRateMetric(
    loadBalancerFullName: string,
    availabilityZoneName: string,
    period: Duration,
  ): IMetric {
    return new MathExpression({
      expression: '((m1 + m2) / m3) * 100',
      label: 'Fault Rate',
      period: period,
      usingMetrics: {
        m1: new Metric({
          metricName: 'HTTPCode_Target_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: '5xxTarget',
        }),
        m2: new Metric({
          metricName: 'HTTPCode_ELB_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: '5xxELB',
        }),
        m3: new Metric({
          metricName: 'RequestCount',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: 'Requests',
        }),
      },
    });
  }

  /**
       * Creates a regional processed bytes metric for the specified load balancer
       * @param loadBalancerFullName
       * @param period
       * @returns
       */
  static createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName: string, period: Duration): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/ApplicationELB',
      unit: Unit.COUNT,
      period: period,
      statistic: 'Sum',
      dimensionsMap: {
        LoadBalancer: loadBalancerFullName,
      },
      label: 'ProcessedBytes',
    });
  }

  /**
       * Creates a zonal processed bytes metric for the specified load balancer
       * @param loadBalancerFullName
       * @param availabilityZoneName
       * @param period
       * @returns
       */
  static createZonalApplicationLoadBalancerProcessedBytesMetric(
    loadBalancerFullName: string,
    availabilityZoneName: string,
    period: Duration,
  ): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/ApplicationELB',
      unit: Unit.COUNT,
      period: period,
      statistic: 'Sum',
      dimensionsMap: {
        LoadBalancer: loadBalancerFullName,
        AvailabilityZone: availabilityZoneName,
      },
      label: 'ProcessedBytes',
    });
  }

  /**
       * Increments a str by one char, for example
       * a -> b
       * z -> aa
       * ad -> ae
       *
       * This wraps at z and adds a new 'a'
       * @param str
       * @returns
       */
  static nextChar(str: string): string {
    if (str.length == 0) {
      return 'a';
    }
    let charA: string[] = str.split('');

    if (charA[charA.length - 1] === 'z') {
      return AvailabilityAndLatencyMetrics.nextChar(str.substring(0, charA.length - 1)) + 'a';
    } else {
      return str.substring(0, charA.length - 1) +
                String.fromCharCode(charA[charA.length - 1].charCodeAt(0) + 1);
    }
  }

  /**
       * General purpose method to create availability metrics
       * @param props
       * @param dimensions
       * @returns
       */
  private static createAvailabilityMetric(props: AvailabilityMetricProps, dimensions: { [key: string]: string }): IMetric {
    let counter: number = 0;
    let key: string = '';

    let usingMetrics: { [key: string]: IMetric } = {};

    let successKeys: string[] = [];
    let faultKeys: string[] = [];

    if (props.metricDetails.successMetricNames !== undefined && props.metricType != AvailabilityMetricType.FAULT_COUNT) {
      props.metricDetails.successMetricNames.forEach((successMetric: string) => {
        let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == '') ? '' : props.keyPrefix.toLowerCase() + '_') +
                    props.metricDetails.operationName.toLowerCase() + '_' +
                    successMetric.toLowerCase();

        key = keyPrefix + '_' + counter++;
        successKeys.push(key);

        usingMetrics[key] = new Metric({
          namespace: props.metricDetails.metricNamespace,
          metricName: successMetric,
          unit: props.metricDetails.unit,
          period: props.metricDetails.period,
          statistic: props.metricDetails.alarmStatistic,
          dimensionsMap: dimensions,
          label: successMetric,
        });
      });
    }

    if (props.metricDetails.faultMetricNames !== undefined && props.metricType != AvailabilityMetricType.SUCCESS_COUNT) {
      props.metricDetails.faultMetricNames.forEach((faultMetric) => {
        let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == '') ? '' : props.keyPrefix.toLowerCase() + '_') +
                    props.metricDetails.operationName.toLowerCase() + '_' +
                    faultMetric.toLowerCase();

        key = keyPrefix + '_' + counter++;
        faultKeys.push(key);

        usingMetrics[key] = new Metric({
          namespace: props.metricDetails.metricNamespace,
          metricName: faultMetric,
          unit: props.metricDetails.unit,
          period: props.metricDetails.period,
          statistic: props.metricDetails.alarmStatistic,
          dimensionsMap: dimensions,
          label: faultMetric,
        });
      });
    }

    let expression: string = '';

    switch (props.metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `((${successKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${successKeys.join('+')}+${faultKeys.join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `(${faultKeys.join('+')})`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `((${faultKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `(${successKeys.join('+')})`;
        break;
    }

    return new MathExpression({
      expression: expression,
      label: props.label,
      period: props.metricDetails.period,
      usingMetrics: usingMetrics,
    });
  }

  /**
       * General purpose method to create latency metrics, the reason this creates an array of metrics while the
       * equivalent availability metric method doesn't is because in availability, we can just sum the count of different
       * metric names while for latency we can't sum the count because that's not what's being measured. It allows the
       * caller to decide if they only want to take the first name, or average all of the names
       * (like SuccessLatency and BigItemSuccessLatency).
       *
       * @param props
       * @param dimensions
       * @returns
       */
  private static createLatencyMetrics(props: LatencyMetricProps, dimensions: { [key: string]: string }): IMetric[] {
    let names: string[];

    switch (props.metricType) {
      default:
      case LatencyMetricType.SUCCESS_LATENCY:
        names = props.metricDetails.successMetricNames;
        break;
      case LatencyMetricType.FAULT_LATENCY:
        names = props.metricDetails.faultMetricNames;
        break;
    }

    return names.map(x => new Metric({
      metricName: x,
      namespace: props.metricDetails.metricNamespace,
      unit: props.metricDetails.unit,
      period: props.metricDetails.period,
      statistic: props.statistic,
      dimensionsMap: dimensions,
      label: props.label,
    }));
  }

  /**
     * Takes all of the success or failure latency metric names and creates an average of those
     * names, if there's only 1 name, it just returns that metric
     * @param props
     * @param dimensions
     */
  private static createAverageLatencyMetric(props: LatencyMetricProps, dimensions: { [key: string]: string }): IMetric {
    let latencyMetrics: IMetric[] = AvailabilityAndLatencyMetrics.createLatencyMetrics(props, dimensions);

    if (latencyMetrics.length == 1) {
      return latencyMetrics[0];
    } else {
      let usingMetrics: {[key: string]: IMetric} = {};

      for (let i = 0; i < latencyMetrics.length; i++) {
        usingMetrics['a' + i] = latencyMetrics[i];
      }

      return new MathExpression({
        expression: `(${Object.keys(usingMetrics).join('+')})/${usingMetrics.length}`,
        label: props.label,
        period: props.metricDetails.period,
        usingMetrics: usingMetrics,
      });
    }
  }
}