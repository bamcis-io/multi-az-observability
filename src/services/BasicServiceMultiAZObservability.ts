import { Fn } from 'aws-cdk-lib';
import { Alarm, AlarmRule, ComparisonOperator, CompositeAlarm, Dashboard, IAlarm, IMetric, MathExpression, Metric, TreatMissingData, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { BaseLoadBalancer, HttpCodeElb, HttpCodeTarget, IApplicationLoadBalancer, ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { IBasicServiceMultiAZObservability } from './IBasicServiceMultiAZObservability';
import { BasicServiceMultiAZObservabilityProps } from './props/BasicServiceMultiAZObservabilityProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { IAvailabilityZoneMapper } from '../azmapper/IAvailabilityZoneMapper';
import { ChiSquaredFunction } from '../chi-squared/ChiSquaredFunction';
import { IChiSquaredFunction } from '../chi-squared/IChiSquaredFunction';
import { BasicServiceDashboard } from '../dashboards/BasicServiceDashboard';
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';

/**
 * Basic observability for a service using metrics from
 * ALBs and NAT Gateways
 */
export class BasicServiceMultiAZObservability extends Construct
  implements IBasicServiceMultiAZObservability {

  /**
       * The NAT Gateways being used in the service, each set of NAT Gateways
       * are keyed by their Availability Zone Id
       */
  natGateways?: { [key: string]: CfnNatGateway[] };

  /**
       * The application load balancers being used by the service
       */
  applicationLoadBalancers?: IApplicationLoadBalancer[];

  /**
       * The name of the service
       */
  serviceName: string;

  /**
       * The alarms indicating if an AZ is an outlier for NAT GW
       * packet loss and has isolated impact
       */
  natGWZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
       * The alarms indicating if an AZ is an outlier for ALB
       * faults and has isolated impact
       */
  albZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
       * The alarms indicating if an AZ has isolated impact
       * from either ALB or NAT GW metrics
       */
  aggregateZonalIsolatedImpactAlarms: { [key: string]: IAlarm };

  /**
       * The dashboard that is optionally created
       */
  dashboard?: Dashboard;

  /**
     * The chi-squared function
     */
  private chiSquaredFunction?: IChiSquaredFunction;

  private azMapper: IAvailabilityZoneMapper;

  private _natGWZonalIsolatedImpactAlarms: { [key: string]: IAlarm };

  private _albZonalIsolatedImpactAlarms: { [key: string]: IAlarm };

  private _packetDropsPerZone: { [key: string]: IMetric };

  private _faultsPerZone: { [key: string]: IMetric };

  constructor(scope: Construct, id: string, props: BasicServiceMultiAZObservabilityProps) {
    super(scope, id);

    // Initialize class properties
    this.serviceName = props.serviceName;
    this.applicationLoadBalancers = props.applicationLoadBalancers;
    this.natGateways = props.natGateways;
    this._natGWZonalIsolatedImpactAlarms = {};
    this._albZonalIsolatedImpactAlarms = {};
    this.aggregateZonalIsolatedImpactAlarms = {};
    this._packetDropsPerZone = {};
    this._faultsPerZone = {};

    // Create the AZ mapper resource to translate AZ names to ids
    this.azMapper = new AvailabilityZoneMapper(this, 'AvailabilityZoneMapper');

    if (props.outlierDetectionAlgorithm == OutlierDetectionAlgorithm.CHI_SQUARED) {
      this.chiSquaredFunction = new ChiSquaredFunction(this, 'ChiSquaredFunction', {});
    }

    // Create metrics and alarms for just load balancers if they were provided
    if (this.applicationLoadBalancers !== undefined && this.applicationLoadBalancers != null) {
      this.doAlbMetrics(props);
    }

    // Create NAT Gateway metrics and alarms
    if (this.natGateways !== undefined && this.natGateways != null) {
      this.doNatGatewayMetrics(props);
    }

    let counter: number = 1;
    // Go through the ALB zonal isolated impact alarms and see if there is a NAT GW
    // isolated impact alarm for the same AZ ID, if so, create a composite alarm with both
    // otherwise create a composite alarm with just the ALB
    Object.keys(this._albZonalIsolatedImpactAlarms).forEach((az: string) => {
      let tmp: IAlarm[] = [];
      tmp.push(this._albZonalIsolatedImpactAlarms[az]);
      if (this._natGWZonalIsolatedImpactAlarms[az] !== undefined &&
                this._natGWZonalIsolatedImpactAlarms[az] != null) {
        tmp.push(this._natGWZonalIsolatedImpactAlarms[az]);
      }
      let availabilityZoneId: string = this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(az.substring(az.length - 1));

      this.aggregateZonalIsolatedImpactAlarms[az] = new CompositeAlarm(this, 'AZ' + counter++ + 'AggregateIsolatedImpactAlarm', {
        compositeAlarmName: availabilityZoneId + '-aggregate-isolated-impact',
        alarmRule: AlarmRule.anyOf(...tmp),
        actionsEnabled: false,
      });
    });

    // In case there were AZs with only a NAT GW and no ALB, create a composite alarm
    // for the NAT GW metrics
    Object.keys(this._natGWZonalIsolatedImpactAlarms).forEach((az: string) => {
      // If we don't yet have an isolated impact alarm for this AZ, proceed
      if (this.aggregateZonalIsolatedImpactAlarms[az] === undefined ||
                this.aggregateZonalIsolatedImpactAlarms[az] == null) {
        let tmp: IAlarm[] = [];
        tmp.push(this._natGWZonalIsolatedImpactAlarms[az]);

        if (this._albZonalIsolatedImpactAlarms[az] !== undefined &&
                    this.albZonalIsolatedImpactAlarms != null) {
          tmp.push(this.albZonalIsolatedImpactAlarms[az]);
        }

        let availabilityZoneId: string = this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(az.substring(az.length - 1));

        this.aggregateZonalIsolatedImpactAlarms[az] = new CompositeAlarm(this, 'AZ' + counter++ + 'AggregateIsolatedImpactAlarm', {
          compositeAlarmName: availabilityZoneId + '-aggregate-isolated-impact',
          alarmRule: AlarmRule.anyOf(...tmp),
          actionsEnabled: false,
        });
      }
    });

    this.albZonalIsolatedImpactAlarms = this._albZonalIsolatedImpactAlarms;
    this.natGWZonalIsolatedImpactAlarms = this._natGWZonalIsolatedImpactAlarms;

    if (props.createDashboard == true) {
      this.dashboard = new BasicServiceDashboard(this, 'BasicServiceDashboard', {
        serviceName: props.serviceName + Fn.sub('-availability-${AWS::Region'),
        zonalAggregateIsolatedImpactAlarms: this.aggregateZonalIsolatedImpactAlarms,
        zonalLoadBalancerIsolatedImpactAlarms: this.albZonalIsolatedImpactAlarms,
        zonalNatGatewayIsolatedImpactAlarms: this.natGWZonalIsolatedImpactAlarms,
        interval: props.interval,
        zonalLoadBalancerFaultRateMetrics: this._faultsPerZone,
        zonalNatGatewayPacketDropMetrics: this._packetDropsPerZone,
      }).dashboard;
    }
  }

  private doAlbMetrics(props: BasicServiceMultiAZObservabilityProps) {
    // Collect total fault count metrics per AZ
    let albZoneFaultCountMetrics: { [key: string]: IMetric[] } = {};

    // Create fault rate alarms per AZ indicating at least 1 ALB
    // in the AZ saw a fault rate that exceeded the threshold
    let faultRatePercentageAlarms: { [key: string]: IAlarm[] } = {};

    let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');

    // Iterate each ALB
    this.applicationLoadBalancers!.forEach(alb => {

      // Iterate each AZ in the VPC
      alb.vpc?.availabilityZones.forEach((az, index) => {

        let azLetter = az.substring(az.length - 1);

        let availabilityZoneId: string = this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
        faultRatePercentageAlarms[azLetter] = [];

        // 5xx responses from targets
        let target5xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_5XX_COUNT, {
          dimensionsMap: {
            AvailabilityZone: az,
            LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
          },
          label: availabilityZoneId,
          period: props.period,
        });

        // 5xx responses from ELB
        let elb5xx: IMetric = alb.metrics.httpCodeElb(HttpCodeElb.ELB_5XX_COUNT, {
          dimensionsMap: {
            AvailabilityZone: az,
            LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
          },
          label: availabilityZoneId,
          period: props.period,
        });

        // 2xx responses from targets
        let target2xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_2XX_COUNT, {
          dimensionsMap: {
            AvailabilityZone: az,
            LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
          },
          label: availabilityZoneId,
          period: props.period,
        });

        // 3xx responses from targets
        let target3xx: IMetric = alb.metrics.httpCodeTarget(HttpCodeTarget.TARGET_3XX_COUNT, {
          dimensionsMap: {
            AvailabilityZone: az,
            LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
          },
          label: availabilityZoneId,
          period: props.period,
        });

        // 3xx responess from ELB
        let elb3xx: IMetric = alb.metrics.httpCodeElb(HttpCodeElb.ELB_3XX_COUNT, {
          dimensionsMap: {
            AvailabilityZone: az,
            LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
          },
          label: availabilityZoneId,
          period: props.period,
        });

        // Create metrics for total fault count from this ALB
        let usingMetrics: { [key: string]: IMetric } = {};
        usingMetrics[`${keyPrefix}1`] = target5xx;
        usingMetrics[`${keyPrefix}2`] = elb5xx;

        if (albZoneFaultCountMetrics[azLetter] === undefined || albZoneFaultCountMetrics[azLetter] == null) {
          albZoneFaultCountMetrics[azLetter] = [];
        }

        albZoneFaultCountMetrics[azLetter].push(new MathExpression({
          expression: `(${keyPrefix}1 + ${keyPrefix}2)`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId + ' ' + alb.loadBalancerArn + ' fault count',
          period: props.period,
        }));

        // Create metrics to calculate fault rate for this ALB
        usingMetrics = {};
        usingMetrics[`${keyPrefix}1`] = target2xx;
        usingMetrics[`${keyPrefix}2`] = target3xx;
        usingMetrics[`${keyPrefix}3`] = elb3xx;
        usingMetrics[`${keyPrefix}4`] = target5xx;
        usingMetrics[`${keyPrefix}5`] = elb5xx;

        // The ALB fault rate
        let faultRate: IMetric = new MathExpression({
          expression: `((${keyPrefix}4+${keyPrefix}5)/(${keyPrefix}1+${keyPrefix}2+${keyPrefix}3+${keyPrefix}4+${keyPrefix}5)) * 100`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId + ' ' + alb.loadBalancerArn + ' fault rate',
          period: props.period,
        });

        let threshold: number = props.faultCountPercentageThreshold ?? 5;

        // Create a fault rate alarm for the ALB
        let faultRateAlarm: IAlarm = new Alarm(this, 'AZ' + index + keyPrefix + 'FaultRatePercentageAlarm', {
          alarmName: availabilityZoneId + '-' + alb.loadBalancerArn + '-fault-rate',
          actionsEnabled: false,
          metric: faultRate,
          evaluationPeriods: 5,
          datapointsToAlarm: 3,
          threshold: threshold,
          comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        });

        // Add this ALB's fault rate alarm
        faultRatePercentageAlarms[azLetter].push(faultRateAlarm);

        // Get next unique key
        keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
      });

    });

    // Iterate AZs for the ALB fault count metrics
    Object.keys(albZoneFaultCountMetrics).forEach(azLetter => {
      let availabilityZoneId: string = this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

      let counter: number = 1;
      let usingMetrics: { [key: string]: IMetric } = {};

      // Add each ALB's fault count metrics to the dictionary
      albZoneFaultCountMetrics[azLetter].forEach(metric => {
        usingMetrics[`${keyPrefix}${counter++}`] = metric;
      });

      // Sum the total faults for the availability zone across all ALBs
      let totalFaultsPerZone: IMetric = new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        usingMetrics: usingMetrics,
        label: availabilityZoneId + ' fault count',
        period: props.period,
      });

      keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
      counter = 1;

      // Assign the total faults per zone to the dictionary
      this._faultsPerZone[azLetter] = totalFaultsPerZone;
    });

    keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

    let tmp: { [key: string]: IMetric } = {};
    Object.keys(this._faultsPerZone).forEach((azLetter, index) => {
      tmp[`${keyPrefix}${index}`] = this._faultsPerZone[azLetter];
    });

    // Calculate the total faults in the region by adding all AZs together
    let totalFaults: IMetric = new MathExpression({
      expression: Object.keys(tmp).join('+'),
      usingMetrics: tmp,
      label: Fn.ref('AWS::Region') + ' fault count',
      period: props.period,
    });

    switch (props.outlierDetectionAlgorithm) {
      default:
      case OutlierDetectionAlgorithm.STATIC:

        // Finally, iterate back through each AZ
        Object.keys(this._faultsPerZone).forEach((azLetter, index) => {
          keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
          let availabilityZoneId: string = this.azMapper
            .availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          // Determine if AZ is an outlier for faults by exceeding
          // a static threshold
          let outlierMetrics: IMetric;

          // These metrics will give the percent of faults for the AZ
          let usingMetrics: { [key: string]: IMetric } = {};
          usingMetrics[`${keyPrefix}1`] = this._faultsPerZone[azLetter];
          usingMetrics[`${keyPrefix}2`] = totalFaults;
          outlierMetrics = new MathExpression({
            expression: `${keyPrefix}1 / ${keyPrefix}2`,
            usingMetrics: usingMetrics,
          });

          let azIsOutlierForFaults: IAlarm = new Alarm(this, 'AZ' + index + 'FaultCountOutlierAlarm', {
            alarmName: availabilityZoneId + '-fault-count-outlier',
            metric: outlierMetrics,
            threshold: props.outlierThreshold,
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          });

          // Create isolated AZ impact alarms by determining
          // if the AZ is an outlier for fault count and at least
          // one ALB exceeds the fault rate threshold provided
          this._albZonalIsolatedImpactAlarms[azLetter] = new CompositeAlarm(this, 'AZ' + index + 'IsolatedFaultCountImpact', {
            compositeAlarmName: availabilityZoneId + '-isolated-fault-count-impact',
            alarmRule: AlarmRule.allOf(
              azIsOutlierForFaults,
              AlarmRule.anyOf(
                ...faultRatePercentageAlarms[azLetter],
              ),
            ),
          });
        });

        break;
      case OutlierDetectionAlgorithm.CHI_SQUARED:

        let perAZAlbFaultCountMetricQueries: { [key: string]: any } = {
          MetricDataQueries: [],
          StartTime: 0,
          EndTime: 0,
        };

        let key: string = AvailabilityAndLatencyMetrics.nextChar('');

        // Indexed by the AZ name letter, contains a list of metric Ids
        // for the AZ, one for each ALB in the same AZ
        let azSumIds: { [key: string]: string[] } = {};

        props.applicationLoadBalancers!.forEach((alb: IApplicationLoadBalancer) => {

          // Create fault count metrics per load balancer
          // in each AZ
          alb.vpc?.availabilityZones.forEach((az: string) => {

            let azLetter: string = az.substring(az.length - 1);
            let availabilityZoneId: string = this.azMapper
              .availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            if (azSumIds[azLetter] === undefined) {
              azSumIds[azLetter] = [];
            }

            let counter: number = 0;
            let azMetricIds: string[] = [];

            azMetricIds.push(key + counter);

            let query1 = {
              Id: key + counter++,
              Label: az + '.' + alb.loadBalancerDnsName + '-elb',
              ReturnData: true,
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/ApplicationELB',
                  MetricName: HttpCodeElb.ELB_5XX_COUNT,
                  Dimensions: {
                    AvailabilityZone: az,
                    LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
                  },
                },
                Period: 60,
                Stat: 'Sum',
                Unit: 'Count',
              },
            };

            azMetricIds.push(key + counter);

            let query2 = {
              Id: key + counter++,
              Label: az + '.' + alb.loadBalancerDnsName + '-target',
              ReturnData: true,
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/ApplicationELB',
                  MetricName: HttpCodeTarget.TARGET_5XX_COUNT,
                  Dimensions: {
                    AvailabilityZone: az,
                    LoadBalancer: ((alb as ILoadBalancerV2) as BaseLoadBalancer).loadBalancerFullName,
                  },
                },
                Period: 60,
                Stat: 'Sum',
                Unit: 'Count',
              },
            };

            let query3: { [key: string]: any } = {
              Id: key + counter,
              Label: availabilityZoneId,
              ReturnData: true,
              Expression: azMetricIds.join('+'),
            };

            // The metric sum for a single ALB
            azSumIds[azLetter].push(key + counter);

            // The metric queries for this ALB in this AZ
            perAZAlbFaultCountMetricQueries.MetricDataQueries.push(query1);
            perAZAlbFaultCountMetricQueries.MetricDataQueries.push(query2);
            perAZAlbFaultCountMetricQueries.MetricDataQueries.push(query3);

            key = AvailabilityAndLatencyMetrics.nextChar(key);
          });
        });

        // Once metrics are created for each load balancer in each AZ,
        // add the load balancer metrics per AZ together to get a total
        // fault count in each AZ
        let totalFaultCountPerAZIds: {[key: string]: string} = {};

        // Iterate the per ALB metrics in each AZ and add them all together
        // to get a total fault count for the whole AZ across all load balancers
        Object.keys(azSumIds).forEach((azLetter: string, index: number) => {
          key = AvailabilityAndLatencyMetrics.nextChar(key);
          let availabilityZoneId: string = this.azMapper
            .availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          let query: { [key: string]: any } = {
            Id: key + (index + 1),
            Label: availabilityZoneId,
            ReturnData: true,
            Expression: azSumIds[azLetter].join('+'),
          };

          // Add the aggregate az fault count query
          perAZAlbFaultCountMetricQueries.MetricDataQueries.push(query);

          // Record the metric id so we can find it later in the function
          // to evaluate its values
          totalFaultCountPerAZIds[azLetter] = query.Id;
        });

        // Now that total fault count query has been created, create a new
        // metric to calculate chi-squared value
        Object.keys(totalFaultCountPerAZIds).forEach((azLetter: string, index: number) => {

          let availabilityZoneId: string = this.azMapper
            .availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          let outlierMetrics: IMetric = new MathExpression({
            expression:
                        `LAMBDA(${this.chiSquaredFunction?.function.functionName},` +
                        `${props.outlierThreshold},` +
                        `${availabilityZoneId},` +
                        `${JSON.stringify(perAZAlbFaultCountMetricQueries)},` +
                        `${totalFaultCountPerAZIds[azLetter]},` +
                        `${Object.values(totalFaultCountPerAZIds).join(',')})`,
          });

          let azIsOutlierForFaultCount: IAlarm = new Alarm(this, 'AZ' + (index + 1) + 'ALBFaultCountOutlier', {
            metric: outlierMetrics,
            alarmName: availabilityZoneId + '-fault-count-outlier',
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            threshold: 1,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          });

          // In addition to being an outlier for fault count, make sure
          // the fault count is substantial enough to trigger the alarm
          // by making sure at least 1 ALB sees packet loss that exceeds the threshold
          let azIsOutlierAndSeesImpact: IAlarm = new CompositeAlarm(this, 'AZ' + index + 'ALBIsolatedImpact', {
            compositeAlarmName: availabilityZoneId + '-isolated-fault-count-impact',
            alarmRule: AlarmRule.allOf(
              azIsOutlierForFaultCount,
              AlarmRule.anyOf(...faultRatePercentageAlarms[azLetter]),
            ),
          });

          // Record these so they can be used in dashboard or for combination
          // with AZ
          this._albZonalIsolatedImpactAlarms[azLetter] = azIsOutlierAndSeesImpact;

        });

        break;
    }
  }

  private doNatGatewayMetrics(props: BasicServiceMultiAZObservabilityProps) {
    let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');

    // Collect alarms for packet drops exceeding a threshold per NAT GW
    let packetDropPercentageAlarms: { [key: string]: IAlarm[] } = {};

    // For each AZ, create metrics for each NAT GW
    Object.entries(this.natGateways!).forEach((entry, index) => {
      // The number of packet drops for each NAT GW in the AZ
      let packetDropMetricsForAZ: { [key: string]: IMetric } = {};

      let az: string = entry[0];
      let azLetter: string = az.substring(az.length - 1);
      let availabilityZoneId = this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      packetDropPercentageAlarms[azLetter] = [];

      // Iterate through each NAT GW in the current AZ
      entry[1].forEach(natgw => {

        // Calculate packet drops
        let packetDropCount: IMetric = new Metric({
          metricName: 'PacketsDropCount',
          namespace: 'AWS/NATGateway',
          statistic: 'Sum',
          unit: Unit.COUNT,
          label: availabilityZoneId + ' packet drops',
          dimensionsMap: {
            NatGatewayId: natgw.attrNatGatewayId,
          },
          period: props.period,
        });

        // Calculate packets in from source
        let packetsInFromSourceCount: IMetric = new Metric({
          metricName: 'PacketsInFromSource',
          namespace: 'AWS/NATGateway',
          statistic: 'Sum',
          unit: Unit.COUNT,
          label: availabilityZoneId + ' packets in from source',
          dimensionsMap: {
            NatGatewayId: natgw.attrNatGatewayId,
          },
          period: props.period,
        });

        // Calculate packets in from destination
        let packetsInFromDestinationCount: IMetric = new Metric({
          metricName: 'PacketsInFromDestination',
          namespace: 'AWS/NATGateway',
          statistic: 'Sum',
          unit: Unit.COUNT,
          label: availabilityZoneId + ' packets in from destination',
          dimensionsMap: {
            NatGatewayId: natgw.attrNatGatewayId,
          },
          period: props.period,
        });

        let usingMetrics: { [key: string]: IMetric } = {};
        usingMetrics[`${keyPrefix}1`] = packetDropCount;
        usingMetrics[`${keyPrefix}2`] = packetsInFromSourceCount;
        usingMetrics[`${keyPrefix}3`] = packetsInFromDestinationCount;

        // Calculate a percentage of dropped packets for the NAT GW
        let packetDropPercentage: IMetric = new MathExpression({
          expression: `(${keyPrefix}1 / (${keyPrefix}2 + ${keyPrefix}3)) * 100`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId + ' packet drop percentage',
          period: props.period,
        });

        let threshold: number = props.packetLossImpactPercentageThreshold ?? 0.01;

        // Create an alarm for this NAT GW if packet drops exceed the specified threshold
        let packetDropImpactAlarm: IAlarm = new Alarm(this, 'AZ' + (index + 1) + 'PacketDropImpactAlarm', {
          alarmName: availabilityZoneId + '-' + natgw.attrNatGatewayId + '-packet-drop-impact',
          actionsEnabled: false,
          metric: packetDropPercentage,
          threshold: threshold,
          comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
          evaluationPeriods: 5,
          datapointsToAlarm: 3,
        });

        // Collect all of the packet drop impact alarms for each
        // NAT GW in this AZ, need to know at least 1 sees substantial
        // enough impact to consider the AZ as impaired
        packetDropPercentageAlarms[azLetter].push(packetDropImpactAlarm);

        // Collect the packet drop metrics for this AZ so we can
        // add them all together and count total packet drops
        // for all NAT GWs in the AZ
        packetDropMetricsForAZ[`m${index}`] = packetDropCount;
      });

      // Create a metric that adds up all packets drops from each
      // NAT GW in the AZ
      let packetDropsInThisAZ: IMetric = new MathExpression({
        expression: Object.keys(packetDropMetricsForAZ).join('+'),
        usingMetrics: packetDropMetricsForAZ,
        label: availabilityZoneId + ' dropped packets',
        period: props.period,
      });

      // Record these so we can add them up
      // and get a total amount of packet drops
      // in the region across all AZs
      this._packetDropsPerZone[azLetter] = packetDropsInThisAZ;
    });

    keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);

    let tmp: { [key: string]: IMetric } = {};
    Object.keys(this._packetDropsPerZone).forEach((azLetter, index) => {
      tmp[`${keyPrefix}${index}`] = this._packetDropsPerZone[azLetter];
    });

    // Calculate total packet drops for the region
    let totalPacketDrops: IMetric = new MathExpression({
      expression: Object.keys(tmp).join('+'),
      usingMetrics: tmp,
      label: Fn.ref('AWS::Region') + ' dropped packets',
      period: props.period,
    });

    switch (props.outlierDetectionAlgorithm) {
      default:
      case OutlierDetectionAlgorithm.STATIC:

        // Create outlier detection alarms by comparing packet
        // drops in one AZ versus total packet drops in the region
        Object.keys(this._packetDropsPerZone).forEach((azLetter, index) => {
          let azIsOutlierForPacketDrops: IAlarm;
          keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
          let availabilityZoneId: string = this.azMapper
            .availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          // Determine if AZ is an outlier for faults by exceeding
          // a static threshold
          let outlierMetrics: IMetric;

          // These metrics will give the percent of faults for the AZ
          let usingMetrics: { [key: string]: IMetric } = {};
          usingMetrics[`${keyPrefix}1`] = this._packetDropsPerZone[azLetter];
          usingMetrics[`${keyPrefix}2`] = totalPacketDrops;

          outlierMetrics = new MathExpression({
            expression: `(${keyPrefix}1 / ${keyPrefix}2) * 100`,
            usingMetrics: usingMetrics,
            label: availabilityZoneId + ' percentage of dropped packets',
          });

          azIsOutlierForPacketDrops = new Alarm(this, 'AZ' + (index + 1) + 'NATGWDroppedPacketsOutlierAlarm', {
            metric: outlierMetrics,
            alarmName: availabilityZoneId + '-dropped-packets-outlier',
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            threshold: props.outlierThreshold,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          });

          // In addition to being an outlier for packet drops, make sure
          // the packet loss is substantial enough to trigger the alarm
          // by making sure at least 1 NAT GW sees packet loss more than 0.01%
          let azIsOutlierAndSeesImpact: IAlarm = new CompositeAlarm(this, 'AZ' + index + 'NATGWIsolatedImpact', {
            compositeAlarmName: availabilityZoneId + '-isolated-natgw-impact',
            alarmRule: AlarmRule.allOf(
              azIsOutlierForPacketDrops,
              AlarmRule.anyOf(...packetDropPercentageAlarms[azLetter]),
            ),
          });

          // Record these so they can be used in dashboard or for combination
          // with AZ
          this._natGWZonalIsolatedImpactAlarms[azLetter] = azIsOutlierAndSeesImpact;
        });

        break;
      case OutlierDetectionAlgorithm.CHI_SQUARED:

        // Once metrics are created for each load balancer in each AZ,
        // add the load balancer metrics per AZ together to get a total
        // fault count in each AZ
        let totalPacketDropCountPerAZIds: {[key: string]: string} = {};

        let perAZPacketDropsMetricQueries: { [key: string]: any } = {
          MetricDataQueries: [],
          StartTime: 0,
          EndTime: 0,
        };

        let key: string = AvailabilityAndLatencyMetrics.nextChar('');

        Object.keys(props.natGateways!).forEach((az: string) => {
          let azLetter: string = az.substring(az.length - 1);
          let availabilityZoneId: string = this.azMapper.
            availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          let perAZIds: string[] = [];

          // Iterate all NAT GWs in this AZ
          props.natGateways![az].forEach((natGW: CfnNatGateway, index: number) => {

            perAZIds.push(key + index);

            let query: { [key: string]: any } = {
              Id: key + index,
              Label: availabilityZoneId + '_' + natGW.attrNatGatewayId,
              ReturnData: true,
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/NATGateway',
                  MetricName: 'PacketsDropCount',
                  Dimensions: {
                    NatGatewayId: natGW.attrNatGatewayId,
                  },
                },
                Period: 60,
                Stat: 'Sum',
                Unit: 'Count',
              },
            };

            // Create a metric query for their packet drops
            perAZPacketDropsMetricQueries.MetricDataQueries.push(query);
          });

          let query: { [key: string]: any } = {
            Id: key + props.natGateways![az].length,
            Label: availabilityZoneId,
            ReturnData: true,
            Expression: perAZIds.join('+'),
          };

          totalPacketDropCountPerAZIds[azLetter] = query.Id;

          // After collecting all of the packet drops from
          // each NATGW in this AZ, add them all up
          perAZPacketDropsMetricQueries.MetricDataQueries.push(query);

          // Update key for next AZ
          key = AvailabilityAndLatencyMetrics.nextChar(key);
        });

        Object.keys(totalPacketDropCountPerAZIds).forEach((az: string, index: number) => {
          let azLetter: string = az.substring(az.length - 1);

          let availabilityZoneId: string = this.azMapper.
            availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          let outlierMetrics: IMetric = new MathExpression({
            expression:
                        `LAMBDA(${this.chiSquaredFunction?.function.functionName},` +
                        `${props.outlierThreshold},${availabilityZoneId},` +
                        `${JSON.stringify(perAZPacketDropsMetricQueries)},` +
                        `${totalPacketDropCountPerAZIds[azLetter]},` +
                        `${Object.values(totalPacketDropCountPerAZIds).join(',')})`,
          });

          let azIsOutlierForPacketDrops: IAlarm = new Alarm(this, 'AZ' + index + 'NATGWDroppedPacketsOutlierAlarm', {
            metric: outlierMetrics,
            alarmName: availabilityZoneId + '-dropped-packets-outlier',
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            threshold: 1,
            actionsEnabled: false,
            treatMissingData: TreatMissingData.IGNORE,
            comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          });

          // In addition to being an outlier for packet drops, make sure
          // the packet loss is substantial enough to trigger the alarm
          // by making sure at least 1 NAT GW sees packet loss more than 0.01%
          let azIsOutlierAndSeesImpact: IAlarm = new CompositeAlarm(this, 'AZ' + index + 'NATGWIsolatedImpact', {
            compositeAlarmName: availabilityZoneId + '-isolated-natgw-impact',
            alarmRule: AlarmRule.allOf(
              azIsOutlierForPacketDrops,
              AlarmRule.anyOf(...packetDropPercentageAlarms[azLetter]),
            ),
          });

          // Record these so they can be used in dashboard or for combination
          // with AZ
          this._natGWZonalIsolatedImpactAlarms[azLetter] = azIsOutlierAndSeesImpact;
        });

        break;
    }
  }
}