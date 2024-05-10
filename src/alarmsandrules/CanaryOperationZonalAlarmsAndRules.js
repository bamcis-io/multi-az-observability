"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanaryOperationZonalAlarmsAndRules = void 0;
const BaseOperationZonalAlarmsAndRules_1 = require("./BaseOperationZonalAlarmsAndRules");
const AvailabilityAndLatencyAlarmsAndRules_1 = require("./AvailabilityAndLatencyAlarmsAndRules");
/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
class CanaryOperationZonalAlarmsAndRules extends BaseOperationZonalAlarmsAndRules_1.BaseOperationZonalAlarmsAndRules {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.isolatedImpactAlarm = AvailabilityAndLatencyAlarmsAndRules_1.AvailabilityAndLatencyAlarmsAndRules.createCanaryIsolatedAZImpactAlarm(this, props.availabilityMetricDetails.operationName, props.availabilityZoneId, props.counter, this.availabilityZoneIsOutlierForFaults, this.availabilityAlarm, this.availabilityZoneIsOutlierForLatency, this.latencyAlarm, props.nameSuffix);
    }
}
exports.CanaryOperationZonalAlarmsAndRules = CanaryOperationZonalAlarmsAndRules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuYXJ5T3BlcmF0aW9uWm9uYWxBbGFybXNBbmRSdWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseUZBQXNGO0FBRXRGLGlHQUE4RjtBQUk5Rjs7R0FFRztBQUNILE1BQWEsa0NBQW1DLFNBQVEsbUVBQWdDO0lBUXBGLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBOEM7UUFFcEYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLDJFQUFvQyxDQUFDLGlDQUFpQyxDQUM3RixJQUFJLEVBQ0osS0FBSyxDQUFDLHlCQUF5QixDQUFDLGFBQWEsRUFDN0MsS0FBSyxDQUFDLGtCQUFrQixFQUN4QixLQUFLLENBQUMsT0FBTyxFQUNiLElBQUksQ0FBQyxrQ0FBa0MsRUFDdkMsSUFBSSxDQUFDLGlCQUFpQixFQUN0QixJQUFJLENBQUMsbUNBQW1DLEVBQ3hDLElBQUksQ0FBQyxZQUFZLEVBQ2pCLEtBQUssQ0FBQyxVQUFVLENBQ25CLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUF4QkQsZ0ZBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IEJhc2VPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzIH0gZnJvbSBcIi4vQmFzZU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXNcIjtcbmltcG9ydCB7IENhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXNQcm9wcyB9IGZyb20gXCIuL3Byb3BzL0NhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXNQcm9wc1wiO1xuaW1wb3J0IHsgQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeUFsYXJtc0FuZFJ1bGVzIH0gZnJvbSBcIi4vQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeUFsYXJtc0FuZFJ1bGVzXCI7XG5pbXBvcnQgeyBJQ2FuYXJ5T3BlcmF0aW9uWm9uYWxBbGFybXNBbmRSdWxlcyB9IGZyb20gXCIuL0lDYW5hcnlPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzXCI7XG5pbXBvcnQgeyBJQWxhcm0gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2hcIjtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBhbGFybXMgYW5kIHJ1bGVzIGZvciBhIHBhcnRpY3VsYXIgb3BlcmF0aW9uIGFzIG1lYXN1cmVkIGJ5IHRoZSBjYW5hcnlcbiAqL1xuZXhwb3J0IGNsYXNzIENhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXMgZXh0ZW5kcyBCYXNlT3BlcmF0aW9uWm9uYWxBbGFybXNBbmRSdWxlcyBpbXBsZW1lbnRzIElDYW5hcnlPcGVyYXRpb25ab25hbEFsYXJtc0FuZFJ1bGVzXG57XG4gICAgLyoqXG4gICAgICogQWxhcm0gdGhhdCB0cmlnZ2VycyBpZiBlaXRoZXIgbGF0ZW5jeSBvciBhdmFpbGFiaWxpdHkgYnJlYWNoIHRoZSBzcGVjaWZpZWRcbiAgICAgKiB0aHJlc2hvbGQgaW4gdGhpcyBBWiBhbmQgdGhlIEFaIGlzIGFuIG91dGxpZXIgZm9yIGZhdWx0cyBvciBsYXRlbmN5XG4gICAgICovXG4gICAgaXNvbGF0ZWRJbXBhY3RBbGFybTogSUFsYXJtO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENhbmFyeU9wZXJhdGlvblpvbmFsQWxhcm1zQW5kUnVsZXNQcm9wcylcbiAgICB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIHRoaXMuaXNvbGF0ZWRJbXBhY3RBbGFybSA9IEF2YWlsYWJpbGl0eUFuZExhdGVuY3lBbGFybXNBbmRSdWxlcy5jcmVhdGVDYW5hcnlJc29sYXRlZEFaSW1wYWN0QWxhcm0oXG4gICAgICAgICAgICB0aGlzLCBcbiAgICAgICAgICAgIHByb3BzLmF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZSxcbiAgICAgICAgICAgIHByb3BzLmF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgIHByb3BzLmNvdW50ZXIsXG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eVpvbmVJc091dGxpZXJGb3JGYXVsdHMsXG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eUFsYXJtLFxuICAgICAgICAgICAgdGhpcy5hdmFpbGFiaWxpdHlab25lSXNPdXRsaWVyRm9yTGF0ZW5jeSxcbiAgICAgICAgICAgIHRoaXMubGF0ZW5jeUFsYXJtLFxuICAgICAgICAgICAgcHJvcHMubmFtZVN1ZmZpeCxcbiAgICAgICAgKVxuICAgIH1cbn0iXX0=