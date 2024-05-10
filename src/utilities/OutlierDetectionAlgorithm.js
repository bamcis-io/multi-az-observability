"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlierDetectionAlgorithm = void 0;
/**
 * Available algorithms for performing outlier detection, currently
 * only STATIC is supported
 */
var OutlierDetectionAlgorithm;
(function (OutlierDetectionAlgorithm) {
    /**
     * Defines using a static value to compare skew in faults or
     * high latency responses
     */
    OutlierDetectionAlgorithm[OutlierDetectionAlgorithm["STATIC"] = 0] = "STATIC";
    /**
     * Uses the chi squared statistic to determine if there is a statistically
     * significant skew in fault rate or high latency distribution
     */
    OutlierDetectionAlgorithm[OutlierDetectionAlgorithm["CHI_SQUARED"] = 1] = "CHI_SQUARED";
    /**
     * Uses z-score to determine if the skew in faults or high latency respones
     * exceeds a defined number of standard devations (typically 3)
     */
    OutlierDetectionAlgorithm[OutlierDetectionAlgorithm["Z_SCORE"] = 2] = "Z_SCORE";
})(OutlierDetectionAlgorithm || (exports.OutlierDetectionAlgorithm = OutlierDetectionAlgorithm = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3V0bGllckRldGVjdGlvbkFsZ29yaXRobS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk91dGxpZXJEZXRlY3Rpb25BbGdvcml0aG0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7OztHQUdHO0FBQ0gsSUFBWSx5QkFtQlg7QUFuQkQsV0FBWSx5QkFBeUI7SUFFakM7OztPQUdHO0lBQ0gsNkVBQU0sQ0FBQTtJQUVOOzs7T0FHRztJQUNILHVGQUFXLENBQUE7SUFFWDs7O09BR0c7SUFDSCwrRUFBTyxDQUFBO0FBQ1gsQ0FBQyxFQW5CVyx5QkFBeUIseUNBQXpCLHlCQUF5QixRQW1CcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEF2YWlsYWJsZSBhbGdvcml0aG1zIGZvciBwZXJmb3JtaW5nIG91dGxpZXIgZGV0ZWN0aW9uLCBjdXJyZW50bHlcbiAqIG9ubHkgU1RBVElDIGlzIHN1cHBvcnRlZFxuICovXG5leHBvcnQgZW51bSBPdXRsaWVyRGV0ZWN0aW9uQWxnb3JpdGhtXG57XG4gICAgLyoqXG4gICAgICogRGVmaW5lcyB1c2luZyBhIHN0YXRpYyB2YWx1ZSB0byBjb21wYXJlIHNrZXcgaW4gZmF1bHRzIG9yXG4gICAgICogaGlnaCBsYXRlbmN5IHJlc3BvbnNlc1xuICAgICAqL1xuICAgIFNUQVRJQyxcblxuICAgIC8qKlxuICAgICAqIFVzZXMgdGhlIGNoaSBzcXVhcmVkIHN0YXRpc3RpYyB0byBkZXRlcm1pbmUgaWYgdGhlcmUgaXMgYSBzdGF0aXN0aWNhbGx5XG4gICAgICogc2lnbmlmaWNhbnQgc2tldyBpbiBmYXVsdCByYXRlIG9yIGhpZ2ggbGF0ZW5jeSBkaXN0cmlidXRpb25cbiAgICAgKi9cbiAgICBDSElfU1FVQVJFRCxcblxuICAgIC8qKlxuICAgICAqIFVzZXMgei1zY29yZSB0byBkZXRlcm1pbmUgaWYgdGhlIHNrZXcgaW4gZmF1bHRzIG9yIGhpZ2ggbGF0ZW5jeSByZXNwb25lc1xuICAgICAqIGV4Y2VlZHMgYSBkZWZpbmVkIG51bWJlciBvZiBzdGFuZGFyZCBkZXZhdGlvbnMgKHR5cGljYWxseSAzKVxuICAgICAqL1xuICAgIFpfU0NPUkVcbn0iXX0=