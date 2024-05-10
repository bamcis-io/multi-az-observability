import { Construct } from "constructs";
import { ServiceAvailabilityAndLatencyDashboardProps } from "./props/ServiceAvailabilityAndLatencyDashboardProps";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
import { IServiceAvailabilityAndLatencyDashboard } from "./IServiceAvailabilityAndLatencyDashboard";
/**
 * Creates a service level availability and latency dashboard
 */
export declare class ServiceAvailabilityAndLatencyDashboard extends Construct implements IServiceAvailabilityAndLatencyDashboard {
    /**
     * The service level dashboard
     */
    dashboard: Dashboard;
    constructor(scope: Construct, id: string, props: ServiceAvailabilityAndLatencyDashboardProps);
    private static generateTPSWidgets;
    private static generateServerSideAndCanaryAvailabilityWidgets;
    private static generateAvailabilityWidgets;
    private static createRegionalAvailabilityMetricProps;
    private static createZonalAvailabilityMetricProps;
}
