import { Fn } from "aws-cdk-lib";
import {
  AlarmStatusWidget,
  Dashboard,
  GraphWidget,
  IAlarm,
  IMetric,
  IWidget,
  PeriodOverride,
  TextWidget,
} from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { BasicServiceDashboardProps } from "./props/BasicServiceDashboardProps";

export class BasicServiceDashboard extends Construct {
  private static createLoadBalancerWidgets(
    alarms: { [key: string]: IAlarm },
    metrics: { [key: string]: IMetric },
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: "Load Balancer Fault Count Metrics",
        height: 2,
        width: 24,
      }),
    );

    let rowTracker: number = 0;

    Object.keys(alarms).forEach((availabilityZoneId, index) => {
      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + " Load Balancer Faults",
          region: Fn.sub("${AWS::Region}"),
          left: [metrics[availabilityZoneId]],
          statistic: "Sum",
          leftYAxis: {
            min: 0,
            label: "Fault Count",
            showUnits: false,
          },
        }),
      );

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (index % 3 == 2 || index - 1 == Object.keys(alarms).length) {
        for (let k = rowTracker; k <= index; k++) {
          let azId: string = Object.keys(alarms).at(k)!;
          widgets.push(
            new AlarmStatusWidget({
              height: 2,
              width: 8,
              alarms: [ alarms[azId] ]
            }),
          );
        }

        rowTracker += index + 1;
      }
    });

    return widgets;
  }

  private static createNatGatewayWidgets(
    alarms: { [key: string]: IAlarm },
    metrics: { [key: string]: IMetric },
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: "NAT Gateway Dropped Packet Metrics",
        height: 2,
        width: 24,
      }),
    );

    let rowTracker: number = 0;

    Object.keys(alarms).forEach((availabilityZoneId, index) => {
      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + " NAT Gateway Dropped Packets",
          region: Fn.sub("${AWS::Region}"),
          left: [metrics[availabilityZoneId]],
          statistic: "Sum",
          leftYAxis: {
            min: 0,
            label: "Dropped packets",
            showUnits: false,
          },
        }),
      );

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (index % 3 == 2 || index - 1 == Object.keys(alarms).length) {
        for (let k = rowTracker; k <= index; k++) {
          let azId: string = Object.keys(alarms).at(k)!;
          widgets.push(
            new AlarmStatusWidget({
              height: 2,
              width: 8,
              alarms: [ alarms[azId] ]
            }),
          );
        }

        rowTracker += index + 1;
      }
    });

    return widgets;
  }

  private static createTopLevelAlarmWidgets(alarms: {
    [key: string]: IAlarm;
  }): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: "Availability Zone Isolated Impact Alarms",
        height: 2,
        width: 24,
      }),
    );

    Object.keys(alarms).forEach((availabilityZoneId) => {
      widgets.push(
        new AlarmStatusWidget({
          alarms: [alarms[availabilityZoneId]],
          height: 2,
          width: 8,
          title: availabilityZoneId + " Aggregate Isolated Impact",
        }),
      );
    });

    return widgets;
  }

  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: BasicServiceDashboardProps) {
    super(scope, id);

    let widgets: IWidget[][] = [];

    widgets.push(
      BasicServiceDashboard.createTopLevelAlarmWidgets(
        props.zonalAggregateIsolatedImpactAlarms,
      ),
    );

    if (
      props.zonalLoadBalancerIsolatedImpactAlarms !== undefined &&
      props.zonalLoadBalancerFaultRateMetrics !== undefined
    ) {
      widgets.push(
        BasicServiceDashboard.createLoadBalancerWidgets(
          props.zonalLoadBalancerIsolatedImpactAlarms,
          props.zonalLoadBalancerFaultRateMetrics,
        ),
      );
    }

    if (
      props.zonalNatGatewayIsolatedImpactAlarms !== undefined &&
      props.zonalNatGatewayPacketDropMetrics !== undefined
    ) {
      widgets.push(
        BasicServiceDashboard.createNatGatewayWidgets(
          props.zonalNatGatewayIsolatedImpactAlarms,
          props.zonalNatGatewayPacketDropMetrics,
        ),
      );
    }

    this.dashboard = new Dashboard(this, "BasicServiceDashboard", {
      dashboardName:
        props.serviceName.toLowerCase() +
        Fn.sub("-service-availability-${AWS::Region}"),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.INHERIT,
      widgets: widgets,
    });
  }
}
