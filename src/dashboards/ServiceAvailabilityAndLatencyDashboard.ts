import { Fn } from 'aws-cdk-lib';
import { AlarmStatusWidget, Color, Dashboard, GraphWidget, IMetric, IWidget, MathExpression, PeriodOverride, TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { IServiceAvailabilityAndLatencyDashboard } from './IServiceAvailabilityAndLatencyDashboard';
import { ServiceAvailabilityAndLatencyDashboardProps } from './props/ServiceAvailabilityAndLatencyDashboardProps';
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';
import { AvailabilityMetricProps } from '../metrics/props/AvailabilityMetricProps';
import { IOperation } from '../services/IOperation';
import { IOperationMetricDetails } from '../services/IOperationMetricDetails';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { AvailabilityZoneMapper } from '../utilities/AvailabilityZoneMapper';
import { IAvailabilityZoneMapper } from '../utilities/IAvailabilityZoneMapper';

/**
 * Creates a service level availability and latency dashboard
 */
export class ServiceAvailabilityAndLatencyDashboard extends Construct implements IServiceAvailabilityAndLatencyDashboard {

  private static generateTPSWidgets(props: ServiceAvailabilityAndLatencyDashboardProps, availabilityZoneIds: string[]) : IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(new TextWidget({ height: 2, width: 24, markdown: '**TPS Metrics**' }));

    widgets.push(new GraphWidget({
      height: 6,
      width: 24,
      title: Fn.ref('AWS::Region') + ' TPS',
      region: Fn.ref('AWS::Region'),
      left: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
        label: Fn.ref('AWS::Region') + ' tps',
        period: props.service.period,
        availabilityMetricProps: props.service.operations.filter(x => x.isCritical).map(x => {
          return {
            label: x.operationName,
            metricDetails: x.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.REQUEST_COUNT,
          };
        }),
      }),
      statistic: 'Sum',
      leftYAxis: {
        label: 'TPS',
        showUnits: false,
      },
    }));

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = availabilityZoneIds[i];

      let zonalMetricProps = {
        availabilityMetricProps: props.service.operations.filter(x => x.isCritical).map(x => {
          return {
            availabilityZoneId: availabilityZoneId,
            label: x.operationName,
            metricDetails: x.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.REQUEST_COUNT,
          };
        }),
        period: props.service.period,
        label: availabilityZoneId + 'tps',
      };

      widgets.push(new GraphWidget({
        height: 6,
        width: 8,
        title: availabilityZoneId + ' TPS',
        region: Fn.ref('AWS::Region'),
        left: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics(zonalMetricProps),
        statistic: 'Sum',
        leftYAxis: {
          label: 'TPS',
          showUnits: false,
        },
      }));
    }

    return widgets;
  }

  private static generateServerSideAndCanaryAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({ height: 2, width: 24, markdown: '**Server-side Availability**\n(Each operation is equally weighted regardless of request volume)' }),
    );

    widgets = widgets.concat(
      ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, false, availabilityZoneIds),
    );

    if (props.service.operations.filter(x => x.isCritical && x.canaryMetricDetails !== undefined).length > 0) {
      widgets.push(
        new TextWidget(
          { height: 2, width: 24, markdown: '**Canary Measured Availability**\n(Each operation is equally weighted regardless of request volume)' },
        ),
      );

      widgets = widgets.concat(ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(props, true, availabilityZoneIds));
    }

    return widgets;
  }

  private static generateAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    isCanary: boolean,
    availabilityZoneIds: string[],
  ) : IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(new GraphWidget({
      height: 6,
      width: 24,
      title: Fn.ref('AWS::Region') + ' Availability',
      region: Fn.ref('AWS::Region'),
      left: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
        label: Fn.ref('AWS::Region') + ' availability',
        period: props.service.period,
        availabilityMetricProps: this.createRegionalAvailabilityMetricProps(
          props.service.operations.filter(x => x.isCritical), isCanary, AvailabilityMetricType.SUCCESS_RATE,
        ),
      }),
      statistic: 'Sum',
      leftYAxis: {
        max: 100,
        min: 95,
        label: 'Availability',
        showUnits: false,
      },
      right: AvailabilityAndLatencyMetrics.createRegionalServiceAvailabilityMetrics({
        label: Fn.ref('AWS::Region') + ' faults',
        period: props.service.period,
        availabilityMetricProps: this.createRegionalAvailabilityMetricProps(
          props.service.operations.filter(x => x.isCritical), isCanary, AvailabilityMetricType.FAULT_COUNT,
        ),
      }),
      rightYAxis: {
        label: 'Faults',
        showUnits: false,
        min: 0,
        max: Math.ceil(props.service.faultCountThreshold * 1.5),
      },
      rightAnnotations: [
        {
          color: Color.RED,
          label: 'High severity',
          value: props.service.faultCountThreshold,
        },
      ],
    }));

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId = availabilityZoneIds[i];

      widgets.push(new GraphWidget({
        height: 6,
        width: 8,
        title: availabilityZoneId + ' Availability',
        region: Fn.ref('AWS::Region'),
        left: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics({
          label: availabilityZoneId + ' availability',
          period: props.service.period,
          availabilityMetricProps: this.createZonalAvailabilityMetricProps(
            props.service.operations.filter(x => x.isCritical),
            availabilityZoneId,
            isCanary,
            AvailabilityMetricType.SUCCESS_RATE),
        }),
        statistic: 'Sum',
        leftYAxis: {
          max: 100,
          min: 95,
          label: 'Availability',
          showUnits: false,
        },
        right: AvailabilityAndLatencyMetrics.createZonalServiceAvailabilityMetrics({
          label: availabilityZoneId + ' faults',
          period: props.service.period,
          availabilityMetricProps: this.createZonalAvailabilityMetricProps(
            props.service.operations.filter(x => x.isCritical),
            availabilityZoneId,
            isCanary,
            AvailabilityMetricType.FAULT_COUNT),
        }),
        rightYAxis: {
          label: 'Faults',
          showUnits: false,
          min: 0,
          max: Math.ceil(props.service.faultCountThreshold * 1.5),
        },
        rightAnnotations: [
          {
            color: Color.RED,
            label: 'High severity',
            value: props.service.faultCountThreshold,
          },
        ],
      }));
    }

    return widgets;
  }

  private static createRegionalAvailabilityMetricProps(
    criticalOperations: IOperation[],
    isCanary: boolean,
    metricType: AvailabilityMetricType,
  ) : AvailabilityMetricProps[] {
    return criticalOperations.reduce((filtered, value) => {
      if (isCanary && value.canaryMetricDetails !== undefined && value.canaryMetricDetails != null) {
        filtered.push(value.canaryMetricDetails.canaryAvailabilityMetricDetails);
      } else if (!isCanary) {
        filtered.push(value.serverSideAvailabilityMetricDetails);
      }
      return filtered;
    }, [] as IOperationMetricDetails[])
      .map(x => {
        return {
          label: x.operationName + ' faults',
          metricDetails: x,
          metricType: metricType,
        };
      });
  }

  private static createZonalAvailabilityMetricProps(
    criticalOperations: IOperation[],
    availabilityZoneId: string,
    isCanary: boolean,
    metricType: AvailabilityMetricType,
  ) : AvailabilityMetricProps[] {
    return criticalOperations.reduce((filtered, value) => {
      if (isCanary && value.canaryMetricDetails !== undefined && value.canaryMetricDetails != null) {
        filtered.push(value.canaryMetricDetails.canaryAvailabilityMetricDetails);
      } else if (!isCanary) {
        filtered.push(value.serverSideAvailabilityMetricDetails);
      }
      return filtered;
    }, [] as IOperationMetricDetails[])
      .map(x => {
        return {
          label: x.operationName + ' faults',
          metricDetails: x,
          metricType: metricType,
          availabilityZoneId: availabilityZoneId,
        };
      });
  }
  /**
     * The service level dashboard
     */
  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: ServiceAvailabilityAndLatencyDashboardProps) {
    super(scope, id);

    let topLevelAggregateAlarmWidgets: IWidget[] = [];

    let azMapper: IAvailabilityZoneMapper = new AvailabilityZoneMapper(this, 'AZMapper', {
      availabilityZoneNames: props.service.availabilityZoneNames,
    });

    let availabilityZoneIds: string[] = props.service.availabilityZoneNames.map(x => {
      return azMapper.availabilityZoneId(x);
    });

    topLevelAggregateAlarmWidgets.push(new TextWidget({
      height: 2,
      width: 24,
      markdown: '***Availability and Latency Alarms***',
    }));

    topLevelAggregateAlarmWidgets.push(new AlarmStatusWidget({
      height: 2,
      width: 24,
      alarms: [
        props.aggregateRegionalAlarm,
      ],
      title: 'Customer Experience - Regional Aggregate Impact Alarm (measures fault count in aggregate across all critical operations)',
    }));

    let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');
    let perOperationAZFaultsMetrics: IMetric[] = [];

    for (let i = 0; i < props.service.availabilityZoneNames.length; i++) {
      let counter: number = 1;
      let availabilityZoneId: string = azMapper.availabilityZoneId(props.service.availabilityZoneNames[i]);

      topLevelAggregateAlarmWidgets.push(new AlarmStatusWidget({
        height: 2,
        width: 8,
        alarms: [
          props.zonalAggregateAlarms[i],
        ],
        title: availabilityZoneId +
          ' Zonal Isolated Impact Alarm (any critical operation in this AZ shows impact from server-side or canary)',
      }));

      let usingMetrics: {[key: string]: IMetric} = {};

      props.service.operations.filter(x => x.isCritical == true).forEach(x => {
        usingMetrics[`${keyPrefix}${counter++}`] = AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          metricDetails: x.serverSideAvailabilityMetricDetails,
          label: availabilityZoneId + ' ' + x.operationName + ' fault count',
          metricType: AvailabilityMetricType.FAULT_COUNT,
          keyPrefix: keyPrefix,
        });
      });

      let zonalFaultCount: IMetric = new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        label: availabilityZoneId + ' fault count',
        usingMetrics: usingMetrics,
      });

      perOperationAZFaultsMetrics.push(zonalFaultCount);
      keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
    }

    let azContributorWidgets: IWidget[] = [
      new TextWidget({ height: 2, width: 24, markdown: '**AZ Contributors To Faults**' }),
      new GraphWidget({
        height: 6,
        width: 24,
        title: 'AZ Fault Count',
        period: props.service.period,
        left: perOperationAZFaultsMetrics,
      }),
    ];

    topLevelAggregateAlarmWidgets.concat(ServiceAvailabilityAndLatencyDashboard.generateTPSWidgets(props, availabilityZoneIds));

    this.dashboard = new Dashboard(this, 'TopLevelDashboard', {
      dashboardName: props.service.serviceName.toLowerCase() + Fn.sub('-service-availability-and-latency-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.INHERIT,
      widgets: [
        topLevelAggregateAlarmWidgets,
        azContributorWidgets,
        ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryAvailabilityWidgets(props, availabilityZoneIds),
      ],
    });
  }
}