"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityMetricType = void 0;
/**
 * Different availability metric types
 */
var AvailabilityMetricType;
(function (AvailabilityMetricType) {
    /**
     * The success rate, i.e. (successful responses) / (successful + fault responses) * 100
     */
    AvailabilityMetricType[AvailabilityMetricType["SUCCESS_RATE"] = 0] = "SUCCESS_RATE";
    /**
     * The number of success responses as an absolute value
     */
    AvailabilityMetricType[AvailabilityMetricType["SUCCESS_COUNT"] = 1] = "SUCCESS_COUNT";
    /**
     * The fault rate, i.e. (fault responses) / (successful + fault responses) * 100
     */
    AvailabilityMetricType[AvailabilityMetricType["FAULT_RATE"] = 2] = "FAULT_RATE";
    /**
     * The number of fault responses as an absolute value
     */
    AvailabilityMetricType[AvailabilityMetricType["FAULT_COUNT"] = 3] = "FAULT_COUNT";
    /**
     * The number of requests received that resulted in either a fault or success. This
     * does not include "error" responses that would be equivalent to 4xx responses.
     */
    AvailabilityMetricType[AvailabilityMetricType["REQUEST_COUNT"] = 4] = "REQUEST_COUNT";
})(AvailabilityMetricType || (exports.AvailabilityMetricType = AvailabilityMetricType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF2YWlsYWJpbGl0eU1ldHJpY1R5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7O0dBRUc7QUFDSCxJQUFZLHNCQTJCWDtBQTNCRCxXQUFZLHNCQUFzQjtJQUU5Qjs7T0FFRztJQUNILG1GQUFZLENBQUE7SUFFWjs7T0FFRztJQUNILHFGQUFhLENBQUE7SUFFYjs7T0FFRztJQUNILCtFQUFVLENBQUE7SUFFVjs7T0FFRztJQUNILGlGQUFXLENBQUE7SUFFWDs7O09BR0c7SUFDSCxxRkFBYSxDQUFBO0FBQ2pCLENBQUMsRUEzQlcsc0JBQXNCLHNDQUF0QixzQkFBc0IsUUEyQmpDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEaWZmZXJlbnQgYXZhaWxhYmlsaXR5IG1ldHJpYyB0eXBlc1xuICovXG5leHBvcnQgZW51bSBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlXG57XG4gICAgLyoqXG4gICAgICogVGhlIHN1Y2Nlc3MgcmF0ZSwgaS5lLiAoc3VjY2Vzc2Z1bCByZXNwb25zZXMpIC8gKHN1Y2Nlc3NmdWwgKyBmYXVsdCByZXNwb25zZXMpICogMTAwXG4gICAgICovXG4gICAgU1VDQ0VTU19SQVRFLFxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBzdWNjZXNzIHJlc3BvbnNlcyBhcyBhbiBhYnNvbHV0ZSB2YWx1ZVxuICAgICAqL1xuICAgIFNVQ0NFU1NfQ09VTlQsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmF1bHQgcmF0ZSwgaS5lLiAoZmF1bHQgcmVzcG9uc2VzKSAvIChzdWNjZXNzZnVsICsgZmF1bHQgcmVzcG9uc2VzKSAqIDEwMFxuICAgICAqL1xuICAgIEZBVUxUX1JBVEUsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGZhdWx0IHJlc3BvbnNlcyBhcyBhbiBhYnNvbHV0ZSB2YWx1ZVxuICAgICAqL1xuICAgIEZBVUxUX0NPVU5ULFxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiByZXF1ZXN0cyByZWNlaXZlZCB0aGF0IHJlc3VsdGVkIGluIGVpdGhlciBhIGZhdWx0IG9yIHN1Y2Nlc3MuIFRoaXNcbiAgICAgKiBkb2VzIG5vdCBpbmNsdWRlIFwiZXJyb3JcIiByZXNwb25zZXMgdGhhdCB3b3VsZCBiZSBlcXVpdmFsZW50IHRvIDR4eCByZXNwb25zZXMuXG4gICAgICovXG4gICAgUkVRVUVTVF9DT1VOVFxufSJdfQ==