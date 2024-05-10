"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationMetricDetails = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * Generic metric details for an operation
 */
class OperationMetricDetails {
    constructor(props) {
        this.alarmStatistic = props.alarmStatistic;
        this.datapointsToAlarm = props.datapointsToAlarm;
        this.evaluationPeriods = props.evaluationPeriods;
        this.faultAlarmThreshold = props.faultAlarmThreshold;
        this.faultMetricNames = props.faultMetricNames;
        this.graphedFaultStatistics = props.graphedFaultStatistics;
        this.graphedSuccessStatistics = props.graphedSuccessStatistics;
        this.metricNamespace = props.metricNamespace;
        this.operationName = props.operationName;
        this.period = props.period;
        this.successAlarmThreshold = props.successAlarmThreshold;
        this.successMetricNames = props.successMetricNames;
        this.unit = props.unit;
        this.metricDimensions = props.metricDimensions;
    }
}
exports.OperationMetricDetails = OperationMetricDetails;
_a = JSII_RTTI_SYMBOL_1;
OperationMetricDetails[_a] = { fqn: "multi-az-observability.OperationMetricDetails", version: "0.1.12" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aW9uTWV0cmljRGV0YWlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9wZXJhdGlvbk1ldHJpY0RldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFNQTs7R0FFRztBQUNILE1BQWEsc0JBQXNCO0lBc0YvQixZQUFZLEtBQWtDO1FBRTFDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDO1FBQ2pELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUM7UUFDakQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQy9DLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsc0JBQXNCLENBQUM7UUFDM0QsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQztRQUMvRCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFDO1FBQ3pELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDbkQsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7SUFDbkQsQ0FBQzs7QUF0R0wsd0RBdUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVW5pdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IE9wZXJhdGlvbk1ldHJpY0RldGFpbHNQcm9wcyB9IGZyb20gXCIuL3Byb3BzL09wZXJhdGlvbk1ldHJpY0RldGFpbHNQcm9wc1wiO1xuaW1wb3J0IHsgSU9wZXJhdGlvbk1ldHJpY0RldGFpbHMgfSBmcm9tIFwiLi9JT3BlcmF0aW9uTWV0cmljRGV0YWlsc1wiO1xuaW1wb3J0IHsgSU1ldHJpY0RpbWVuc2lvbnMgfSBmcm9tIFwiLi9JTWV0cmljRGltZW5zaW9uc1wiO1xuXG4vKipcbiAqIEdlbmVyaWMgbWV0cmljIGRldGFpbHMgZm9yIGFuIG9wZXJhdGlvblxuICovXG5leHBvcnQgY2xhc3MgT3BlcmF0aW9uTWV0cmljRGV0YWlscyBpbXBsZW1lbnRzIElPcGVyYXRpb25NZXRyaWNEZXRhaWxzXG57XG4gICAgLyoqXG4gICAgICogVGhlIG9wZXJhdGlvbiB0aGVzZSBtZXRyaWMgZGV0YWlscyBhcmUgZm9yXG4gICAgICovXG4gICAgcmVhZG9ubHkgb3BlcmF0aW9uTmFtZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhlIENsb3VkV2F0Y2ggbWV0cmljIG5hbWVzcGFjZSBmb3IgdGhlc2UgbWV0cmljc1xuICAgICAqL1xuICAgIHJlYWRvbmx5IG1ldHJpY05hbWVzcGFjZTogc3RyaW5nOyAgXG4gICAgICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lcyBvZiBzdWNjZXNzIGluZGljYXRpbmcgbWV0cmljc1xuICAgICAqL1xuICAgIHJlYWRvbmx5IHN1Y2Nlc3NNZXRyaWNOYW1lczogc3RyaW5nW107IFxuXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWVzIG9mIGZhdWx0IGluZGljYXRpbmcgbWV0cmljc1xuICAgICAqL1xuICAgIHJlYWRvbmx5IGZhdWx0TWV0cmljTmFtZXM6IHN0cmluZ1tdICAgIFxuXG4gICAgLyoqXG4gICAgICogVGhlIHN0YXRpc3RpYyB1c2VkIGZvciBhbGFybXMsIGZvciBhdmFpbGFiaWxpdHkgbWV0cmljcyB0aGlzIHNob3VsZFxuICAgICAqIGJlIFwiU3VtXCIsIGZvciBsYXRlbmN5IG1ldHJpY3MgaXQgY291bGQgc29tZXRoaW5nIGxpa2UgXCJwOTlcIiBvciBcInA5OS45XCJcbiAgICAgKi9cbiAgICByZWFkb25seSBhbGFybVN0YXRpc3RpYzogc3RyaW5nOyAgXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3RhdGlzdGljcyBmb3Igc3VjY2Vzc2VzIHlvdSB3YW50IHRvIGFwcGVhciBvbiBkYXNoYm9hcmRzLCBmb3IgZXhhbXBsZSwgd2l0aFxuICAgICAqIGxhdGVuY3kgbWV0cmljcywgeW91IG1pZ2h0IHdhbnQgcDUwLCBwOTksIGFuZCB0bTk5LiBGb3IgYXZhaWxhYmlsaXR5XG4gICAgICogbWV0cmljcyB0aGlzIHdpbGwgdHlwaWNhbGx5IGp1c3QgYmUgXCJTdW1cIi5cbiAgICAgKiBcbiAgICAgKiBAZGVmYXVsdCAtIEZvciBhdmFpbGFiaWxpdHkgbWV0cmljcywgdGhpcyB3aWxsIGJlIFwiU3VtXCIsIGZvciBsYXRlbmN5IG1ldHJpY3MgaXQgd2lsbCBiZSBqdXN0IFwicDk5XCJcbiAgICAgKi9cbiAgICByZWFkb25seSBncmFwaGVkU3VjY2Vzc1N0YXRpc3RpY3M/OiBzdHJpbmdbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzdGF0aXN0aWNzIGZvciBmYXVsdHMgeW91IHdhbnQgdG8gYXBwZWFyIG9uIGRhc2hib2FyZHMsIGZvciBleGFtcGxlLCB3aXRoXG4gICAgICogbGF0ZW5jeSBtZXRyaWNzLCB5b3UgbWlnaHQgd2FudCBwNTAsIHA5OSwgYW5kIHRtOTkuIEZvciBhdmFpbGFiaWxpdHlcbiAgICAgKiBtZXRyaWNzIHRoaXMgd2lsbCB0eXBpY2FsbHkganVzdCBiZSBcIlN1bVwiLlxuICAgICAqIFxuICAgICAqIEBkZWZhdWx0IC0gRm9yIGF2YWlsYWJpbGl0eSBtZXRyaWNzLCB0aGlzIHdpbGwgYmUgXCJTdW1cIiwgZm9yIGxhdGVuY3kgbWV0cmljcyBpdCB3aWxsIGJlIGp1c3QgXCJwOTlcIlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M/OiBzdHJpbmdbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSB1bml0IHVzZWQgZm9yIHRoZXNlIG1ldHJpY3NcbiAgICAgKi9cbiAgICByZWFkb25seSB1bml0OiBVbml0OyAgICAgXG5cbiAgICAvKipcbiAgICAgKiBUaGUgcGVyaW9kIGZvciB0aGUgbWV0cmljc1xuICAgICAqL1xuICAgIHJlYWRvbmx5IHBlcmlvZDogRHVyYXRpb247ICAgICBcbiAgICAgXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBldmFsdWF0aW9uIHBlcmlvZHMgZm9yIGxhdGVuY3kgYW5kIGF2YWlsYWJpbHRpeSBhbGFybXNcbiAgICAgKi9cbiAgICByZWFkb25seSBldmFsdWF0aW9uUGVyaW9kczogbnVtYmVyOyAgIFxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBkYXRhcG9pbnRzIHRvIGFsYXJtIG9uIGZvciBsYXRlbmN5IGFuZCBhdmFpbGFiaWxpdHkgYWxhcm1zXG4gICAgICovXG4gICAgcmVhZG9ubHkgZGF0YXBvaW50c1RvQWxhcm06IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSB0aHJlc2hvbGQgZm9yIGFsYXJtcyBhc3NvY2lhdGVkIHdpdGggc3VjY2VzcyBtZXRyaWNzLCBmb3IgZXhhbXBsZSBpZiBtZWFzdXJpbmdcbiAgICAgKiBzdWNjZXNzIHJhdGUsIHRoZSB0aHJlc2hvbGQgbWF5IGJlIDk5LCBtZWFuaW5nIHlvdSB3b3VsZCB3YW50IGFuIGFsYXJtIHRoYXQgdHJpZ2dlcnNcbiAgICAgKiBpZiBzdWNjZXNzIGRyb3BzIGJlbG93IDk5JS5cbiAgICAgKi9cbiAgICByZWFkb25seSBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IG51bWJlcjsgICBcblxuICAgIC8qKlxuICAgICAqIFRoZSB0aHJlc2hvbGQgZm9yIGFsYXJtcyBhc3NvY2lhdGVkIHdpdGggZmF1bHQgbWV0cmljcywgZm9yIGV4YW1wbGUgaWYgbWVhc3VyaW5nXG4gICAgICogZmF1bHQgcmF0ZSwgdGhlIHRocmVzaG9sZCBtYXkgYmUgMSwgbWVhbmluZyB5b3Ugd291bGQgd2FudCBhbiBhbGFybSB0aGF0IHRyaWdnZXJzXG4gICAgICogaWYgdGhlIGZhdWx0IHJhdGUgZ29lcyBhYm92ZSAxJS5cbiAgICAgKi9cbiAgICByZWFkb25seSBmYXVsdEFsYXJtVGhyZXNob2xkOiBudW1iZXI7ICAgIFxuXG4gICAgLyoqXG4gICAgICogVGhlIG1ldHJpYyBkaW1lbnNpb25zIGZvciB0aGlzIG9wZXJhdGlvbiwgbXVzdCBiZSBpbXBsZW1lbnRlZFxuICAgICAqIGFzIGEgY29uY3JldGUgY2xhc3MgYnkgdGhlIHVzZXJcbiAgICAgKi9cbiAgICByZWFkb25seSBtZXRyaWNEaW1lbnNpb25zOiBJTWV0cmljRGltZW5zaW9ucztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBPcGVyYXRpb25NZXRyaWNEZXRhaWxzUHJvcHMpXG4gICAge1xuICAgICAgICB0aGlzLmFsYXJtU3RhdGlzdGljID0gcHJvcHMuYWxhcm1TdGF0aXN0aWM7XG4gICAgICAgIHRoaXMuZGF0YXBvaW50c1RvQWxhcm0gPSBwcm9wcy5kYXRhcG9pbnRzVG9BbGFybTtcbiAgICAgICAgdGhpcy5ldmFsdWF0aW9uUGVyaW9kcyA9IHByb3BzLmV2YWx1YXRpb25QZXJpb2RzO1xuICAgICAgICB0aGlzLmZhdWx0QWxhcm1UaHJlc2hvbGQgPSBwcm9wcy5mYXVsdEFsYXJtVGhyZXNob2xkO1xuICAgICAgICB0aGlzLmZhdWx0TWV0cmljTmFtZXMgPSBwcm9wcy5mYXVsdE1ldHJpY05hbWVzO1xuICAgICAgICB0aGlzLmdyYXBoZWRGYXVsdFN0YXRpc3RpY3MgPSBwcm9wcy5ncmFwaGVkRmF1bHRTdGF0aXN0aWNzO1xuICAgICAgICB0aGlzLmdyYXBoZWRTdWNjZXNzU3RhdGlzdGljcyA9IHByb3BzLmdyYXBoZWRTdWNjZXNzU3RhdGlzdGljcztcbiAgICAgICAgdGhpcy5tZXRyaWNOYW1lc3BhY2UgPSBwcm9wcy5tZXRyaWNOYW1lc3BhY2U7XG4gICAgICAgIHRoaXMub3BlcmF0aW9uTmFtZSA9IHByb3BzLm9wZXJhdGlvbk5hbWU7XG4gICAgICAgIHRoaXMucGVyaW9kID0gcHJvcHMucGVyaW9kO1xuICAgICAgICB0aGlzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZCA9IHByb3BzLnN1Y2Nlc3NBbGFybVRocmVzaG9sZDtcbiAgICAgICAgdGhpcy5zdWNjZXNzTWV0cmljTmFtZXMgPSBwcm9wcy5zdWNjZXNzTWV0cmljTmFtZXM7XG4gICAgICAgIHRoaXMudW5pdCA9IHByb3BzLnVuaXQ7XG4gICAgICAgIHRoaXMubWV0cmljRGltZW5zaW9ucyA9IHByb3BzLm1ldHJpY0RpbWVuc2lvbnM7XG4gICAgfVxufSJdfQ==