"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * The representation of a service composed of multiple operations
 */
class Service {
    /**
     * Adds an operation to this service and sets the operation's
     * service property
     */
    addOperation(operation) {
        this.operations.push(operation);
        return this;
    }
    constructor(props) {
        this.serviceName = props.serviceName;
        this.availabilityZoneNames = props.availabilityZoneNames;
        this.baseUrl = props.baseUrl;
        this.faultCountThreshold = props.faultCountThreshold;
        this.operations = [];
        this.period = props.period;
    }
}
exports.Service = Service;
_a = JSII_RTTI_SYMBOL_1;
Service[_a] = { fqn: "multi-az-observability.Service", version: "0.1.12" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQTs7R0FFRztBQUNILE1BQWEsT0FBTztJQWlDaEI7OztPQUdHO0lBQ0gsWUFBWSxDQUFDLFNBQXFCO1FBRTlCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxZQUFZLEtBQW1CO1FBRTNCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNyQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFDO1FBQ3pELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFDO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDOztBQW5ETCwwQkFvREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgSU9wZXJhdGlvbiB9IGZyb20gXCIuL0lPcGVyYXRpb25cIjtcbmltcG9ydCB7IFNlcnZpY2VQcm9wcyB9IGZyb20gXCIuL3Byb3BzL1NlcnZpY2VQcm9wc1wiO1xuaW1wb3J0IHsgSVNlcnZpY2UgfSBmcm9tIFwiLi9JU2VydmljZVwiO1xuXG4vKipcbiAqIFRoZSByZXByZXNlbnRhdGlvbiBvZiBhIHNlcnZpY2UgY29tcG9zZWQgb2YgbXVsdGlwbGUgb3BlcmF0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgU2VydmljZSBpbXBsZW1lbnRzIElTZXJ2aWNlXG57XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgeW91ciBzZXJ2aWNlXG4gICAgICovXG4gICAgcmVhZG9ubHkgc2VydmljZU5hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGVuZHBvaW50IGZvciB0aGlzIHNlcnZpY2UsIGxpa2UgXCJodHRwczovL3d3dy5leGFtcGxlLmNvbVwiLiBPcGVyYXRpb24gcGF0aHMgd2lsbCBiZSBhcHBlbmRlZCB0byB0aGlzIGVuZHBvaW50IGZvciBjYW5hcnkgdGVzdGluZyB0aGUgc2VydmljZS5cbiAgICAgKi9cbiAgICByZWFkb25seSBiYXNlVXJsOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmF1bHQgY291bnQgdGhyZXNob2xkIHRoYXQgaW5kaWNhdGVzIHRoZSBzZXJ2aWNlIGlzIHVuaGVhbHRoeS4gVGhpcyBpcyBhbiBhYnNvbHV0ZSB2YWx1ZSBvZiBmYXVsdHNcbiAgICAgKiBiZWluZyBwcm9kdWNlZCBieSBhbGwgY3JpdGljYWwgb3BlcmF0aW9ucyBpbiBhZ2dyZWdhdGUuXG4gICAgICovXG4gICAgcmVhZG9ubHkgZmF1bHRDb3VudFRocmVzaG9sZDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogQSBsaXN0IG9mIHRoZSBBdmFpbGFiaWxpdHkgWm9uZSBuYW1lcyB1c2VkIGJ5IHRoaXMgYXBwbGljYXRpb25cbiAgICAgKi9cbiAgICByZWFkb25seSBhdmFpbGFiaWxpdHlab25lTmFtZXM6IHN0cmluZ1tdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHBlcmlvZCBmb3Igd2hpY2ggbWV0cmljcyBmb3IgdGhlIHNlcnZpY2Ugc2hvdWxkIGJlIGFnZ3JlZ2F0ZWQgXG4gICAgICovXG4gICAgcmVhZG9ubHkgcGVyaW9kOiBEdXJhdGlvbjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBvcGVyYXRpb25zIHRoYXQgYXJlIHBhcnQgb2YgdGhpcyBzZXJ2aWNlXG4gICAgICovXG4gICAgcmVhZG9ubHkgb3BlcmF0aW9uczogSU9wZXJhdGlvbltdO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBvcGVyYXRpb24gdG8gdGhpcyBzZXJ2aWNlIGFuZCBzZXRzIHRoZSBvcGVyYXRpb24nc1xuICAgICAqIHNlcnZpY2UgcHJvcGVydHlcbiAgICAgKi9cbiAgICBhZGRPcGVyYXRpb24ob3BlcmF0aW9uOiBJT3BlcmF0aW9uKTogSVNlcnZpY2VcbiAgICB7XG4gICAgICAgIHRoaXMub3BlcmF0aW9ucy5wdXNoKG9wZXJhdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBTZXJ2aWNlUHJvcHMpXG4gICAge1xuICAgICAgICB0aGlzLnNlcnZpY2VOYW1lID0gcHJvcHMuc2VydmljZU5hbWU7XG4gICAgICAgIHRoaXMuYXZhaWxhYmlsaXR5Wm9uZU5hbWVzID0gcHJvcHMuYXZhaWxhYmlsaXR5Wm9uZU5hbWVzO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSBwcm9wcy5iYXNlVXJsO1xuICAgICAgICB0aGlzLmZhdWx0Q291bnRUaHJlc2hvbGQgPSBwcm9wcy5mYXVsdENvdW50VGhyZXNob2xkO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5wZXJpb2QgPSBwcm9wcy5wZXJpb2Q7XG4gICAgfVxufSJdfQ==