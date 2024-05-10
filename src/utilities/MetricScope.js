"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricScope = void 0;
var MetricScope;
(function (MetricScope) {
    /**
     * The metric scope is for an operation in a single Availability Zone
     */
    MetricScope[MetricScope["OPERATION_ZONAL"] = 0] = "OPERATION_ZONAL";
    /**
     * The metric scope is for an operation in the whole Region
     */
    MetricScope[MetricScope["OPERATION_REGIONAL"] = 1] = "OPERATION_REGIONAL";
    /**
     * The metric scope is for a service in a single Availability Zone
     */
    MetricScope[MetricScope["SERVICE_ZONAL"] = 2] = "SERVICE_ZONAL";
    /**
     * The metric scope is for a service in the whole Region
     */
    MetricScope[MetricScope["SERVICE_REGIONAL"] = 3] = "SERVICE_REGIONAL";
})(MetricScope || (exports.MetricScope = MetricScope = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0cmljU2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNZXRyaWNTY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFZLFdBcUJYO0FBckJELFdBQVksV0FBVztJQUVuQjs7T0FFRztJQUNILG1FQUFlLENBQUE7SUFFZjs7T0FFRztJQUNILHlFQUFrQixDQUFBO0lBRWxCOztPQUVHO0lBQ0gsK0RBQWEsQ0FBQTtJQUViOztPQUVHO0lBQ0gscUVBQWdCLENBQUE7QUFDcEIsQ0FBQyxFQXJCVyxXQUFXLDJCQUFYLFdBQVcsUUFxQnRCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gTWV0cmljU2NvcGVcbntcbiAgICAvKipcbiAgICAgKiBUaGUgbWV0cmljIHNjb3BlIGlzIGZvciBhbiBvcGVyYXRpb24gaW4gYSBzaW5nbGUgQXZhaWxhYmlsaXR5IFpvbmVcbiAgICAgKi9cbiAgICBPUEVSQVRJT05fWk9OQUwsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWV0cmljIHNjb3BlIGlzIGZvciBhbiBvcGVyYXRpb24gaW4gdGhlIHdob2xlIFJlZ2lvblxuICAgICAqL1xuICAgIE9QRVJBVElPTl9SRUdJT05BTCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBtZXRyaWMgc2NvcGUgaXMgZm9yIGEgc2VydmljZSBpbiBhIHNpbmdsZSBBdmFpbGFiaWxpdHkgWm9uZVxuICAgICAqL1xuICAgIFNFUlZJQ0VfWk9OQUwsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWV0cmljIHNjb3BlIGlzIGZvciBhIHNlcnZpY2UgaW4gdGhlIHdob2xlIFJlZ2lvblxuICAgICAqL1xuICAgIFNFUlZJQ0VfUkVHSU9OQUxcbn0iXX0=