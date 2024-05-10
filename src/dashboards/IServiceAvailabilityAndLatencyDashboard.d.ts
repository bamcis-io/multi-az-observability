import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
/**
 * A service-level availability and latency dashboard
 */
export interface IServiceAvailabilityAndLatencyDashboard {
    /**
     * The service availability and latency dashboard
     */
    dashboard: Dashboard;
}
