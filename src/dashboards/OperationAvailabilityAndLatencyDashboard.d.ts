import { Construct } from "constructs";
import { OperationAvailabilityAndLatencyDashboardProps } from "./props/OperationAvailabilityAndLatencyDashboardProps";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
import { IOperationAvailabilityAndLatencyDashboard } from "./IOperationAvailabilityAndLatencyDashboard";
/**
 * Creates an operation level availability and latency dashboard
 */
export declare class OperationAvailabilityAndLatencyDashboard extends Construct implements IOperationAvailabilityAndLatencyDashboard {
    /**
     * The operation level dashboard
     */
    dashboard: Dashboard;
    private azMapper;
    constructor(scope: Construct, id: string, props: OperationAvailabilityAndLatencyDashboardProps);
    private static createTopLevelAggregateAlarmWidgets;
    private static createAvailabilityWidgets;
    private static createLatencyWidgets;
    private createApplicationLoadBalancerWidgets;
}
