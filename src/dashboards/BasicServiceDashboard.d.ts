import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { BasicServiceDashboardProps } from "./props/BasicServiceDashboardProps";
export declare class BasicServiceDashboard extends Construct {
    dashboard: Dashboard;
    constructor(scope: Construct, id: string, props: BasicServiceDashboardProps);
    private static createLoadBalancerWidgets;
    private static createNatGatewayWidgets;
    private static createTopLevelAlarmWidgets;
}
