"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanaryMetrics = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * Represents metrics for a canary testing a service
 */
class CanaryMetrics {
    constructor(props) {
        this.canaryAvailabilityMetricDetails = props.canaryAvailabilityMetricDetails;
        this.canaryContributorInsightRuleDetails = props.canaryContributorInsightRuleDetails;
        this.canaryLatencyMetricDetails = props.canaryLatencyMetricDetails;
    }
}
exports.CanaryMetrics = CanaryMetrics;
_a = JSII_RTTI_SYMBOL_1;
CanaryMetrics[_a] = { fqn: "multi-az-observability.CanaryMetrics", version: "0.1.12" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuYXJ5TWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNhbmFyeU1ldHJpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQTs7R0FFRztBQUNILE1BQWEsYUFBYTtJQW9CdEIsWUFBWSxLQUF3QjtRQUVoQyxJQUFJLENBQUMsK0JBQStCLEdBQUcsS0FBSyxDQUFDLCtCQUErQixDQUFDO1FBQzdFLElBQUksQ0FBQyxtQ0FBbUMsR0FBRyxLQUFLLENBQUMsbUNBQW1DLENBQUM7UUFDckYsSUFBSSxDQUFDLDBCQUEwQixHQUFHLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztJQUN2RSxDQUFDOztBQXpCTCxzQ0EwQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQ2FuYXJ5TWV0cmljcyB9IGZyb20gXCIuL0lDYW5hcnlNZXRyaWNzXCI7XG5pbXBvcnQgeyBJQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHMgfSBmcm9tIFwiLi9JQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHNcIjtcbmltcG9ydCB7IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzIH0gZnJvbSBcIi4vSU9wZXJhdGlvbk1ldHJpY0RldGFpbHNcIjtcbmltcG9ydCB7IENhbmFyeU1ldHJpY1Byb3BzIH0gZnJvbSBcIi4vcHJvcHMvQ2FuYXJ5TWV0cmljUHJvcHNcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIG1ldHJpY3MgZm9yIGEgY2FuYXJ5IHRlc3RpbmcgYSBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5hcnlNZXRyaWNzIGltcGxlbWVudHMgSUNhbmFyeU1ldHJpY3NcbntcbiAgICAvKipcbiAgICAgKiBUaGUgY2FuYXJ5IGF2YWlsYWJpbGl0eSBtZXRyaWMgZGV0YWlsc1xuICAgICAqL1xuICAgIHJlYWRvbmx5IGNhbmFyeUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbmFyeSBsYXRlbmN5IG1ldHJpYyBkZXRhaWxzXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2FuYXJ5TGF0ZW5jeU1ldHJpY0RldGFpbHM6IElPcGVyYXRpb25NZXRyaWNEZXRhaWxzO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBjYW5hcnkgZGV0YWlscyBmb3IgY29udHJpYnV0b3IgaW5zaWdodHMgcnVsZXNcbiAgICAgKiBcbiAgICAgKiBAZGVmYXVsdCAtIE5vIGNvbnRyaWJ1dG9yIGluc2lnaHRzIHJ1bGVzIHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIFxuICAgICAqIGNhbmFyeSBtZXRyaWNzXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2FuYXJ5Q29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM/OiBJQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogQ2FuYXJ5TWV0cmljUHJvcHMpXG4gICAge1xuICAgICAgICB0aGlzLmNhbmFyeUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHMgPSBwcm9wcy5jYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzO1xuICAgICAgICB0aGlzLmNhbmFyeUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzID0gcHJvcHMuY2FuYXJ5Q29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM7XG4gICAgICAgIHRoaXMuY2FuYXJ5TGF0ZW5jeU1ldHJpY0RldGFpbHMgPSBwcm9wcy5jYW5hcnlMYXRlbmN5TWV0cmljRGV0YWlscztcbiAgICB9XG59Il19