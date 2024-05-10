"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityAndLatencyMetrics = void 0;
const AvailabilityMetricType_1 = require("../utilities/AvailabilityMetricType");
const LatencyMetricType_1 = require("../utilities/LatencyMetricType");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_cdk_lib_1 = require("aws-cdk-lib");
/**
 * Class for creating availability and latency metrics that can be used in alarms and graphs
 */
class AvailabilityAndLatencyMetrics {
    /**
     * Creates a zonal availability metric
     * @param props
     * @returns
     */
    static createZonalAvailabilityMetric(props) {
        return this.createAvailabilityMetric(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, aws_cdk_lib_1.Fn.ref("AWS::Region")));
        //return this.createAvailabilityMetric(props, props.metricDetails.zonalDimensions(Fn.ref("AWS::Region")));
    }
    /**
     * Creates a regional availability metric
     * @param props
     * @returns
     */
    static createRegionalAvailabilityMetric(props) {
        return this.createAvailabilityMetric(props, props.metricDetails.metricDimensions.regionalDimensions(aws_cdk_lib_1.Fn.ref("AWS::Region")));
    }
    /**
     * General purpose method to create availability metrics
     * @param props
     * @param dimensions
     * @returns
     */
    static createAvailabilityMetric(props, dimensions) {
        let counter = 0;
        let key = "";
        let usingMetrics = {};
        let successKeys = [];
        let faultKeys = [];
        if (props.metricDetails.successMetricNames !== undefined && props.metricType != AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT) {
            props.metricDetails.successMetricNames.forEach((successMetric) => {
                let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == "") ? "" : props.keyPrefix.toLowerCase() + "_") +
                    props.metricDetails.operationName.toLowerCase() + "_" +
                    successMetric.toLowerCase();
                key = keyPrefix + "_" + counter++;
                successKeys.push(key);
                usingMetrics[key] = new aws_cloudwatch_1.Metric({
                    namespace: props.metricDetails.metricNamespace,
                    metricName: successMetric,
                    unit: props.metricDetails.unit,
                    period: props.metricDetails.period,
                    statistic: props.metricDetails.alarmStatistic,
                    dimensionsMap: dimensions,
                    label: successMetric
                });
            });
        }
        if (props.metricDetails.faultMetricNames !== undefined && props.metricType != AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_COUNT) {
            props.metricDetails.faultMetricNames.forEach((faultMetric) => {
                let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == "") ? "" : props.keyPrefix.toLowerCase() + "_") +
                    props.metricDetails.operationName.toLowerCase() + "_" +
                    faultMetric.toLowerCase();
                key = keyPrefix + "_" + counter++;
                faultKeys.push(key);
                usingMetrics[key] = new aws_cloudwatch_1.Metric({
                    namespace: props.metricDetails.metricNamespace,
                    metricName: faultMetric,
                    unit: props.metricDetails.unit,
                    period: props.metricDetails.period,
                    statistic: props.metricDetails.alarmStatistic,
                    dimensionsMap: dimensions,
                    label: faultMetric
                });
            });
        }
        let expression = "";
        switch (props.metricType) {
            case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE:
                expression = `((${successKeys.join("+")}) / (${successKeys.join("+")}+${faultKeys.join("+")})) * 100`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT:
                expression = `${successKeys.join("+")}+${faultKeys.join("+")}`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT:
                expression = `(${faultKeys.join("+")})`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_RATE:
                expression = `((${faultKeys.join("+")}) / (${successKeys.join("+")}+${faultKeys.join("+")})) * 100`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_COUNT:
                expression = `(${successKeys.join("+")})`;
                break;
        }
        return new aws_cloudwatch_1.MathExpression({
            expression: expression,
            label: props.label,
            period: props.metricDetails.period,
            usingMetrics: usingMetrics
        });
    }
    /**
     * Creates a zonal latency metric
     * @param props
     * @returns
     */
    static createZonalLatencyMetrics(props) {
        return this.createLatencyMetrics(props, props.metricDetails.metricDimensions.zonalDimensions(props.availabilityZoneId, aws_cdk_lib_1.Fn.ref("AWS::Region")));
        //return this.createLatencyMetrics(props, props.metricDetails.zonalDimensions(Fn.ref("AWS::Region")));
    }
    /**
     * Creates a regional latency metric
     * @param props
     * @returns
     */
    static createRegionalLatencyMetrics(props) {
        return this.createLatencyMetrics(props, props.metricDetails.metricDimensions.regionalDimensions(aws_cdk_lib_1.Fn.ref("AWS::Region")));
    }
    /**
     * General purpose method to create latency metrics
     * @param props
     * @param dimensions
     * @returns
     */
    static createLatencyMetrics(props, dimensions) {
        let names;
        switch (props.metricType) {
            default:
            case LatencyMetricType_1.LatencyMetricType.SUCCESS_LATENCY:
                names = props.metricDetails.successMetricNames;
                break;
            case LatencyMetricType_1.LatencyMetricType.FAULT_LATENCY:
                names = props.metricDetails.faultMetricNames;
                break;
        }
        return names.map(x => new aws_cloudwatch_1.Metric({
            metricName: x,
            namespace: props.metricDetails.metricNamespace,
            unit: props.metricDetails.unit,
            period: props.metricDetails.period,
            statistic: props.statistic,
            dimensionsMap: dimensions,
            label: props.label
        }));
    }
    /**
     * Creates a regional service level availability metrics, one metric for
     * each operation at the regional level and the service.
     * @param props
     * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
     * are the metrics for each operation included in the request availability metric props.
     */
    static createRegionalServiceAvailabilityMetrics(props) {
        let usingMetrics = {};
        let operationMetrics = [];
        let counter = 0;
        props.availabilityMetricProps.forEach(prop => {
            let keyPrefix = ((prop.keyPrefix === undefined || prop.keyPrefix == "") ? "" : prop.keyPrefix.toLowerCase() + "_") +
                //prop.metricDetails.service.serviceName.toLowerCase() + "_" +
                prop.metricDetails.operationName.toLowerCase() + "_" +
                prop.metricType.toString().toLowerCase();
            let regionalOperationAvailabilityMetric = this.createRegionalAvailabilityMetric(prop);
            operationMetrics.push(regionalOperationAvailabilityMetric);
            usingMetrics[`${keyPrefix}${counter++}`] = regionalOperationAvailabilityMetric;
        });
        let expression = "";
        if (props.availabilityMetricProps.length > 0) {
            if (props.availabilityMetricProps[0].metricType == undefined || props.availabilityMetricProps[0] == null) {
                console.log(props.availabilityMetricProps[0].metricDetails.operationName);
                console.log(props.availabilityMetricProps[0].metricDetails.alarmStatistic);
            }
            switch (props.availabilityMetricProps[0].metricType) {
                case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE:
                    expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                    break;
                case AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT:
                    expression = `${Object.keys(usingMetrics).join("+")}`;
                    break;
                case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT:
                    expression = `${Object.keys(usingMetrics).join("+")}`;
                    break;
                case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_RATE:
                    expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                    break;
                case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_COUNT:
                    expression = `${Object.keys(usingMetrics).join("+")}`;
                    break;
            }
            let math = new aws_cloudwatch_1.MathExpression({
                usingMetrics: usingMetrics,
                period: props.period,
                label: props.label,
                expression: expression
            });
            operationMetrics.splice(0, 0, math);
        }
        else {
            console.log("Got 0 metrics");
        }
        return operationMetrics;
    }
    /**
     * Creates a zonal service level availability metrics, one metric for
     * each operation at the zonal level and the service.
     * @param props
     * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
     * are the metrics for each operation included in the request availability metric props.
     */
    static createZonalServiceAvailabilityMetrics(props) {
        let usingMetrics = {};
        let operationMetrics = [];
        let counter = 0;
        props.availabilityMetricProps.forEach(prop => {
            let keyPrefix = ((prop.keyPrefix === undefined || prop.keyPrefix == "") ? "" : prop.keyPrefix.toLowerCase() + "_") +
                //prop.metricDetails.operation.service.serviceName.toLowerCase() + "_" +
                prop.metricDetails.operationName.toLowerCase() + "_" +
                prop.metricType.toString().toLowerCase();
            let zonalOperationAvailabilityMetric = this.createZonalAvailabilityMetric(prop);
            operationMetrics.push(zonalOperationAvailabilityMetric);
            usingMetrics[`${keyPrefix}${counter++}`] = zonalOperationAvailabilityMetric;
        });
        let expression = "";
        switch (props.availabilityMetricProps[0].metricType) {
            case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.REQUEST_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.FAULT_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;
            case AvailabilityMetricType_1.AvailabilityMetricType.SUCCESS_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
        }
        let math = new aws_cloudwatch_1.MathExpression({
            usingMetrics: usingMetrics,
            period: props.period,
            label: props.label,
            expression: expression
        });
        operationMetrics.splice(0, 0, math);
        return operationMetrics;
    }
    /**
     * Creates a regional fault count metric using 5xx target and load balancer
     * metrics against total requests for the specified load balancer
     * @param period
     * @param loadBalancerFullName
     * @returns
     */
    static createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, period) {
        return new aws_cloudwatch_1.MathExpression({
            expression: "((m1 + m2) / m3) * 100",
            label: "Fault Rate",
            period: period,
            usingMetrics: {
                "m1": new aws_cloudwatch_1.Metric({
                    metricName: "HTTPCode_Target_5XX_Count",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName
                    },
                    label: "5xxTarget"
                }),
                "m2": new aws_cloudwatch_1.Metric({
                    metricName: "HTTPCode_ELB_5XX_Count",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName
                    },
                    label: "5xxELB"
                }),
                "m3": new aws_cloudwatch_1.Metric({
                    metricName: "RequestCount",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName
                    },
                    label: "Requests"
                })
            }
        });
    }
    /**
     * Creates a zonal fault count metric using 5xx target and load balancer
     * metrics against total requests for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns
     */
    static createZonalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName, availabilityZoneName, period) {
        return new aws_cloudwatch_1.MathExpression({
            expression: "((m1 + m2) / m3) * 100",
            label: "Fault Rate",
            period: period,
            usingMetrics: {
                "m1": new aws_cloudwatch_1.Metric({
                    metricName: "HTTPCode_Target_5XX_Count",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName,
                        "AvailabilityZone": availabilityZoneName
                    },
                    label: "5xxTarget"
                }),
                "m2": new aws_cloudwatch_1.Metric({
                    metricName: "HTTPCode_ELB_5XX_Count",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName,
                        "AvailabilityZone": availabilityZoneName
                    },
                    label: "5xxELB"
                }),
                "m3": new aws_cloudwatch_1.Metric({
                    metricName: "RequestCount",
                    namespace: "AWS/ApplicationELB",
                    unit: aws_cloudwatch_1.Unit.COUNT,
                    period: period,
                    statistic: "Sum",
                    dimensionsMap: {
                        "LoadBalancer": loadBalancerFullName,
                        "AvailabilityZone": availabilityZoneName
                    },
                    label: "Requests"
                })
            }
        });
    }
    /**
     * Creates a regional processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param period
     * @returns
     */
    static createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, period) {
        return new aws_cloudwatch_1.Metric({
            metricName: "ProcessedBytes",
            namespace: "AWS/ApplicationELB",
            unit: aws_cloudwatch_1.Unit.COUNT,
            period: period,
            statistic: "Sum",
            dimensionsMap: {
                "LoadBalancer": loadBalancerFullName
            },
            label: "ProcessedBytes"
        });
    }
    /**
     * Creates a zonal processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns
     */
    static createZonalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName, availabilityZoneName, period) {
        return new aws_cloudwatch_1.Metric({
            metricName: "ProcessedBytes",
            namespace: "AWS/ApplicationELB",
            unit: aws_cloudwatch_1.Unit.COUNT,
            period: period,
            statistic: "Sum",
            dimensionsMap: {
                "LoadBalancer": loadBalancerFullName,
                "AvailabilityZone": availabilityZoneName
            },
            label: "ProcessedBytes"
        });
    }
    /**
     * Increments a str by one char, for example
     * a -> b
     * z -> aa
     * ad -> ae
     *
     * This wraps at z and adds a new 'a'
     * @param str
     * @returns
     */
    static nextChar(str) {
        if (str.length == 0) {
            return 'a';
        }
        let charA = str.split('');
        if (charA[charA.length - 1] === 'z') {
            return AvailabilityAndLatencyMetrics.nextChar(str.substring(0, charA.length - 1)) + 'a';
        }
        else {
            return str.substring(0, charA.length - 1) +
                String.fromCharCode(charA[charA.length - 1].charCodeAt(0) + 1);
        }
    }
}
exports.AvailabilityAndLatencyMetrics = AvailabilityAndLatencyMetrics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZhaWxhYmlsaXR5QW5kTGF0ZW5jeU1ldHJpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnRkFBNkU7QUFDN0Usc0VBQW1FO0FBSW5FLCtEQUFrRjtBQUtsRiw2Q0FBMkM7QUFFM0M7O0dBRUc7QUFDSCxNQUFhLDZCQUE2QjtJQUV0Qzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLDZCQUE2QixDQUFDLEtBQW1DO1FBRXBFLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsZ0JBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25KLDBHQUEwRztJQUM5RyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFzQztRQUUxRSxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEksQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQThCLEVBQUUsVUFBbUM7UUFFdkcsSUFBSSxPQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQztRQUVyQixJQUFJLFlBQVksR0FBNkIsRUFBRSxDQUFDO1FBRWhELElBQUksV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUMvQixJQUFJLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFFN0IsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLGtCQUFrQixLQUFLLFNBQVMs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RSxxQkFBSSxDQUFDLEtBQUs7WUFDaEIsTUFBTSxFQUFFLE1BQU07WUFDZCxTQUFTLEVBQUUsS0FBSztZQUNoQixhQUFhLEVBQUU7Z0JBQ1gsY0FBYyxFQUFFLG9CQUFvQjtnQkFDcEMsa0JBQWtCLEVBQUUsb0JBQW9CO2FBQzNDO1lBQ0QsS0FBSyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFXO1FBRXZCLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNsQixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFDRCxJQUFJLEtBQUssR0FBYSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXBDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUNuQyxDQUFDO1lBQ0csT0FBTyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM1RixDQUFDO2FBRUQsQ0FBQztZQUNHLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUF2ZEQsc0VBdWRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXZhaWxhYmlsaXR5TWV0cmljVHlwZSB9IGZyb20gXCIuLi91dGlsaXRpZXMvQXZhaWxhYmlsaXR5TWV0cmljVHlwZVwiO1xuaW1wb3J0IHsgTGF0ZW5jeU1ldHJpY1R5cGUgfSBmcm9tIFwiLi4vdXRpbGl0aWVzL0xhdGVuY3lNZXRyaWNUeXBlXCI7XG5pbXBvcnQgeyBBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyB9IGZyb20gXCIuL3Byb3BzL0F2YWlsYWJpbGl0eU1ldHJpY1Byb3BzXCI7XG5pbXBvcnQgeyBSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzIH0gZnJvbSBcIi4vcHJvcHMvUmVnaW9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wc1wiO1xuaW1wb3J0IHsgWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyB9IGZyb20gXCIuL3Byb3BzL1pvbmFsQXZhaWxhYmlsaXR5TWV0cmljUHJvcHNcIjtcbmltcG9ydCB7IElNZXRyaWMsIE1ldHJpYywgTWF0aEV4cHJlc3Npb24sIFVuaXR9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaFwiO1xuaW1wb3J0IHsgWm9uYWxMYXRlbmN5TWV0cmljUHJvcHMgfSBmcm9tIFwiLi9wcm9wcy9ab25hbExhdGVuY3lNZXRyaWNQcm9wc1wiO1xuaW1wb3J0IHsgTGF0ZW5jeU1ldHJpY1Byb3BzIH0gZnJvbSBcIi4vcHJvcHMvTGF0ZW5jeU1ldHJpY1Byb3BzXCI7XG5pbXBvcnQgeyBSZWdpb25hbExhdGVuY3lNZXRyaWNQcm9wcyB9IGZyb20gXCIuL3Byb3BzL1JlZ2lvbmFsTGF0ZW5jeU1ldHJpY1Byb3BzXCI7XG5pbXBvcnQgeyBTZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljUHJvcHMgfSBmcm9tIFwiLi9wcm9wcy9TZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljUHJvcHNcIjtcbmltcG9ydCB7IER1cmF0aW9uLCBGbiB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG4vKipcbiAqIENsYXNzIGZvciBjcmVhdGluZyBhdmFpbGFiaWxpdHkgYW5kIGxhdGVuY3kgbWV0cmljcyB0aGF0IGNhbiBiZSB1c2VkIGluIGFsYXJtcyBhbmQgZ3JhcGhzXG4gKi9cbmV4cG9ydCBjbGFzcyBBdmFpbGFiaWxpdHlBbmRMYXRlbmN5TWV0cmljc1xue1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB6b25hbCBhdmFpbGFiaWxpdHkgbWV0cmljXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVab25hbEF2YWlsYWJpbGl0eU1ldHJpYyhwcm9wczogWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyk6IElNZXRyaWNcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF2YWlsYWJpbGl0eU1ldHJpYyhwcm9wcywgcHJvcHMubWV0cmljRGV0YWlscy5tZXRyaWNEaW1lbnNpb25zLnpvbmFsRGltZW5zaW9ucyhwcm9wcy5hdmFpbGFiaWxpdHlab25lSWQsIEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpKSk7XG4gICAgICAgIC8vcmV0dXJuIHRoaXMuY3JlYXRlQXZhaWxhYmlsaXR5TWV0cmljKHByb3BzLCBwcm9wcy5tZXRyaWNEZXRhaWxzLnpvbmFsRGltZW5zaW9ucyhGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSByZWdpb25hbCBhdmFpbGFiaWxpdHkgbWV0cmljXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpYyhwcm9wczogUmVnaW9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyk6IElNZXRyaWNcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF2YWlsYWJpbGl0eU1ldHJpYyhwcm9wcywgcHJvcHMubWV0cmljRGV0YWlscy5tZXRyaWNEaW1lbnNpb25zLnJlZ2lvbmFsRGltZW5zaW9ucyhGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYWwgcHVycG9zZSBtZXRob2QgdG8gY3JlYXRlIGF2YWlsYWJpbGl0eSBtZXRyaWNzXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEBwYXJhbSBkaW1lbnNpb25zIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGNyZWF0ZUF2YWlsYWJpbGl0eU1ldHJpYyhwcm9wczogQXZhaWxhYmlsaXR5TWV0cmljUHJvcHMsIGRpbWVuc2lvbnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogSU1ldHJpY1xuICAgIHtcbiAgICAgICAgbGV0IGNvdW50ZXI6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZyA9IFwiXCI7XG5cbiAgICAgICAgbGV0IHVzaW5nTWV0cmljczoge1trZXk6IHN0cmluZ106IElNZXRyaWN9ID0ge307XG5cbiAgICAgICAgbGV0IHN1Y2Nlc3NLZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgZmF1bHRLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGlmIChwcm9wcy5tZXRyaWNEZXRhaWxzLnN1Y2Nlc3NNZXRyaWNOYW1lcyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLm1ldHJpY1R5cGUgIT0gQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVClcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvcHMubWV0cmljRGV0YWlscy5zdWNjZXNzTWV0cmljTmFtZXMuZm9yRWFjaCgoc3VjY2Vzc01ldHJpYykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBrZXlQcmVmaXggPSAoKHByb3BzLmtleVByZWZpeCA9PT0gdW5kZWZpbmVkIHx8IHByb3BzLmtleVByZWZpeCA9PSBcIlwiKSA/IFwiXCIgOiBwcm9wcy5rZXlQcmVmaXgudG9Mb3dlckNhc2UoKSArIFwiX1wiKSArIFxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5tZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKSArIFwiX1wiICsgXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWMudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGtleSA9IGtleVByZWZpeCArIFwiX1wiICsgY291bnRlcisrO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3NLZXlzLnB1c2goa2V5KTtcblxuICAgICAgICAgICAgICAgIHVzaW5nTWV0cmljc1trZXldID0gbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogcHJvcHMubWV0cmljRGV0YWlscy5tZXRyaWNOYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWU6IHN1Y2Nlc3NNZXRyaWMsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6IHByb3BzLm1ldHJpY0RldGFpbHMudW5pdCxcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5tZXRyaWNEZXRhaWxzLnBlcmlvZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiBwcm9wcy5tZXRyaWNEZXRhaWxzLmFsYXJtU3RhdGlzdGljLFxuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25zTWFwOiBkaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogc3VjY2Vzc01ldHJpY1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9wcy5tZXRyaWNEZXRhaWxzLmZhdWx0TWV0cmljTmFtZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wcy5tZXRyaWNUeXBlICE9IEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuU1VDQ0VTU19DT1VOVClcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvcHMubWV0cmljRGV0YWlscy5mYXVsdE1ldHJpY05hbWVzLmZvckVhY2goKGZhdWx0TWV0cmljKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGtleVByZWZpeCA9ICgocHJvcHMua2V5UHJlZml4ID09PSB1bmRlZmluZWQgfHwgcHJvcHMua2V5UHJlZml4ID09IFwiXCIpID8gXCJcIiA6IHByb3BzLmtleVByZWZpeC50b0xvd2VyQ2FzZSgpICsgXCJfXCIpICsgXG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpICsgXCJfXCIgKyBcbiAgICAgICAgICAgICAgICAgICAgZmF1bHRNZXRyaWMudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGtleSA9IGtleVByZWZpeCArIFwiX1wiICsgY291bnRlcisrO1xuICAgICAgICAgICAgICAgIGZhdWx0S2V5cy5wdXNoKGtleSk7XG5cbiAgICAgICAgICAgICAgICB1c2luZ01ldHJpY3Nba2V5XSA9IG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHByb3BzLm1ldHJpY0RldGFpbHMubWV0cmljTmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNOYW1lOiBmYXVsdE1ldHJpYyxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogcHJvcHMubWV0cmljRGV0YWlscy51bml0LFxuICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHByb3BzLm1ldHJpY0RldGFpbHMucGVyaW9kLFxuICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWM6IHByb3BzLm1ldHJpY0RldGFpbHMuYWxhcm1TdGF0aXN0aWMsXG4gICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmYXVsdE1ldHJpY1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBleHByZXNzaW9uOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIHN3aXRjaCAocHJvcHMubWV0cmljVHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2FzZSBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlNVQ0NFU1NfUkFURTpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgoJHtzdWNjZXNzS2V5cy5qb2luKFwiK1wiKX0pIC8gKCR7c3VjY2Vzc0tleXMuam9pbihcIitcIil9KyR7ZmF1bHRLZXlzLmpvaW4oXCIrXCIpfSkpICogMTAwYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5SRVFVRVNUX0NPVU5UOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgJHtzdWNjZXNzS2V5cy5qb2luKFwiK1wiKX0rJHtmYXVsdEtleXMuam9pbihcIitcIil9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9DT1VOVDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgke2ZhdWx0S2V5cy5qb2luKFwiK1wiKX0pYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9SQVRFOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgKCgke2ZhdWx0S2V5cy5qb2luKFwiK1wiKX0pIC8gKCR7c3VjY2Vzc0tleXMuam9pbihcIitcIil9KyR7ZmF1bHRLZXlzLmpvaW4oXCIrXCIpfSkpICogMTAwYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5TVUNDRVNTX0NPVU5UOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgKCR7c3VjY2Vzc0tleXMuam9pbihcIitcIil9KWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb24sXG4gICAgICAgICAgICBsYWJlbDogcHJvcHMubGFiZWwsXG4gICAgICAgICAgICBwZXJpb2Q6IHByb3BzLm1ldHJpY0RldGFpbHMucGVyaW9kLFxuICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB1c2luZ01ldHJpY3NcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgem9uYWwgbGF0ZW5jeSBtZXRyaWNcbiAgICAgKiBAcGFyYW0gcHJvcHMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVpvbmFsTGF0ZW5jeU1ldHJpY3MocHJvcHM6IFpvbmFsTGF0ZW5jeU1ldHJpY1Byb3BzKTogSU1ldHJpY1tdXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVMYXRlbmN5TWV0cmljcyhwcm9wcywgcHJvcHMubWV0cmljRGV0YWlscy5tZXRyaWNEaW1lbnNpb25zLnpvbmFsRGltZW5zaW9ucyhwcm9wcy5hdmFpbGFiaWxpdHlab25lSWQsIEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpKSk7XG4gICAgICAgIC8vcmV0dXJuIHRoaXMuY3JlYXRlTGF0ZW5jeU1ldHJpY3MocHJvcHMsIHByb3BzLm1ldHJpY0RldGFpbHMuem9uYWxEaW1lbnNpb25zKEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHJlZ2lvbmFsIGxhdGVuY3kgbWV0cmljXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbExhdGVuY3lNZXRyaWNzKHByb3BzOiBSZWdpb25hbExhdGVuY3lNZXRyaWNQcm9wcyk6IElNZXRyaWNbXVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTGF0ZW5jeU1ldHJpY3MocHJvcHMsIHByb3BzLm1ldHJpY0RldGFpbHMubWV0cmljRGltZW5zaW9ucy5yZWdpb25hbERpbWVuc2lvbnMoRm4ucmVmKFwiQVdTOjpSZWdpb25cIikpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmFsIHB1cnBvc2UgbWV0aG9kIHRvIGNyZWF0ZSBsYXRlbmN5IG1ldHJpY3NcbiAgICAgKiBAcGFyYW0gcHJvcHMgXG4gICAgICogQHBhcmFtIGRpbWVuc2lvbnMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlTGF0ZW5jeU1ldHJpY3MocHJvcHM6IExhdGVuY3lNZXRyaWNQcm9wcywgZGltZW5zaW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBJTWV0cmljW11cbiAgICB7XG4gICAgICAgIGxldCBuYW1lczogc3RyaW5nW107XG5cbiAgICAgICAgc3dpdGNoIChwcm9wcy5tZXRyaWNUeXBlKVxuICAgICAgICB7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY2FzZSBMYXRlbmN5TWV0cmljVHlwZS5TVUNDRVNTX0xBVEVOQ1k6XG4gICAgICAgICAgICAgICAgbmFtZXMgPSBwcm9wcy5tZXRyaWNEZXRhaWxzLnN1Y2Nlc3NNZXRyaWNOYW1lcztcbiAgICAgICAgICAgICAgICBicmVhazsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlIExhdGVuY3lNZXRyaWNUeXBlLkZBVUxUX0xBVEVOQ1k6XG4gICAgICAgICAgICAgICAgbmFtZXMgPSBwcm9wcy5tZXRyaWNEZXRhaWxzLmZhdWx0TWV0cmljTmFtZXM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmFtZXMubWFwKHggPT4gbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBtZXRyaWNOYW1lOiB4LFxuICAgICAgICAgICAgbmFtZXNwYWNlOiBwcm9wcy5tZXRyaWNEZXRhaWxzLm1ldHJpY05hbWVzcGFjZSxcbiAgICAgICAgICAgIHVuaXQ6IHByb3BzLm1ldHJpY0RldGFpbHMudW5pdCxcbiAgICAgICAgICAgIHBlcmlvZDogcHJvcHMubWV0cmljRGV0YWlscy5wZXJpb2QsXG4gICAgICAgICAgICBzdGF0aXN0aWM6IHByb3BzLnN0YXRpc3RpYyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IGRpbWVuc2lvbnMsXG4gICAgICAgICAgICBsYWJlbDogcHJvcHMubGFiZWxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSByZWdpb25hbCBzZXJ2aWNlIGxldmVsIGF2YWlsYWJpbGl0eSBtZXRyaWNzLCBvbmUgbWV0cmljIGZvclxuICAgICAqIGVhY2ggb3BlcmF0aW9uIGF0IHRoZSByZWdpb25hbCBsZXZlbCBhbmQgdGhlIHNlcnZpY2UuXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRyaWMgYXQgaW5kZXggMCBpcyB0aGUgbWV0cmljIG1hdGggZXhwcmVzc2lvbiBmb3IgdGhlIHdob2xlIHNlcnZpY2UuIFRoZSBmb2xsb3dpbmcgbWV0cmljc1xuICAgICAqIGFyZSB0aGUgbWV0cmljcyBmb3IgZWFjaCBvcGVyYXRpb24gaW5jbHVkZWQgaW4gdGhlIHJlcXVlc3QgYXZhaWxhYmlsaXR5IG1ldHJpYyBwcm9wcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlUmVnaW9uYWxTZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljcyhwcm9wczogU2VydmljZUF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKTogSU1ldHJpY1tdXG4gICAge1xuICAgICAgICBsZXQgdXNpbmdNZXRyaWNzOiB7W2tleTogc3RyaW5nXTogSU1ldHJpY30gPSB7fTtcbiAgICAgICAgbGV0IG9wZXJhdGlvbk1ldHJpY3M6IElNZXRyaWNbXSA9IFtdO1xuICAgICAgICBsZXQgY291bnRlcjogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5UHJlZml4OiBzdHJpbmcgPSAoKHByb3Aua2V5UHJlZml4ID09PSB1bmRlZmluZWQgfHwgcHJvcC5rZXlQcmVmaXggPT0gXCJcIikgPyBcIlwiIDogcHJvcC5rZXlQcmVmaXgudG9Mb3dlckNhc2UoKSArIFwiX1wiKSArIFxuICAgICAgICAgICAgICAgIC8vcHJvcC5tZXRyaWNEZXRhaWxzLnNlcnZpY2Uuc2VydmljZU5hbWUudG9Mb3dlckNhc2UoKSArIFwiX1wiICtcbiAgICAgICAgICAgICAgICBwcm9wLm1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZS50b0xvd2VyQ2FzZSgpICsgXCJfXCIgK1xuICAgICAgICAgICAgICAgIHByb3AubWV0cmljVHlwZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCByZWdpb25hbE9wZXJhdGlvbkF2YWlsYWJpbGl0eU1ldHJpYzogSU1ldHJpYyA9IHRoaXMuY3JlYXRlUmVnaW9uYWxBdmFpbGFiaWxpdHlNZXRyaWMocHJvcCBhcyBSZWdpb25hbEF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3BlcmF0aW9uTWV0cmljcy5wdXNoKHJlZ2lvbmFsT3BlcmF0aW9uQXZhaWxhYmlsaXR5TWV0cmljKTtcbiAgICAgICAgICAgIHVzaW5nTWV0cmljc1tgJHtrZXlQcmVmaXh9JHtjb3VudGVyKyt9YF0gPSByZWdpb25hbE9wZXJhdGlvbkF2YWlsYWJpbGl0eU1ldHJpYztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGV4cHJlc3Npb246IHN0cmluZyA9IFwiXCI7XG5cbiAgICAgICAgaWYgKHByb3BzLmF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNQcm9wc1swXS5tZXRyaWNUeXBlID09IHVuZGVmaW5lZCB8fCBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNQcm9wc1swXSA9PSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHByb3BzLmF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzWzBdLm1ldHJpY0RldGFpbHMub3BlcmF0aW9uTmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHNbMF0ubWV0cmljRGV0YWlscy5hbGFybVN0YXRpc3RpYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAocHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHNbMF0ubWV0cmljVHlwZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXNlIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuU1VDQ0VTU19SQVRFOlxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9KSAvICR7cHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHMubGVuZ3RofWA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5SRVFVRVNUX0NPVU5UOlxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCR7T2JqZWN0LmtleXModXNpbmdNZXRyaWNzKS5qb2luKFwiK1wiKX1gO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuRkFVTFRfQ09VTlQ6XG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgJHtPYmplY3Qua2V5cyh1c2luZ01ldHJpY3MpLmpvaW4oXCIrXCIpfWA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQXZhaWxhYmlsaXR5TWV0cmljVHlwZS5GQVVMVF9SQVRFOlxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9KSAvICR7cHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHMubGVuZ3RofWA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAgICAgICBcbiAgICAgICAgICAgICAgICBjYXNlIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuU1VDQ0VTU19DT1VOVDpcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGAke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9YDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7ICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbWF0aDogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB1c2luZ01ldHJpY3MsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBwcm9wcy5wZXJpb2QsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHByb3BzLmxhYmVsLFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvcGVyYXRpb25NZXRyaWNzLnNwbGljZSgwLCAwLCBtYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR290IDAgbWV0cmljc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcGVyYXRpb25NZXRyaWNzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB6b25hbCBzZXJ2aWNlIGxldmVsIGF2YWlsYWJpbGl0eSBtZXRyaWNzLCBvbmUgbWV0cmljIGZvclxuICAgICAqIGVhY2ggb3BlcmF0aW9uIGF0IHRoZSB6b25hbCBsZXZlbCBhbmQgdGhlIHNlcnZpY2UuXG4gICAgICogQHBhcmFtIHByb3BzIFxuICAgICAqIEByZXR1cm5zIFRoZSBtZXRyaWMgYXQgaW5kZXggMCBpcyB0aGUgbWV0cmljIG1hdGggZXhwcmVzc2lvbiBmb3IgdGhlIHdob2xlIHNlcnZpY2UuIFRoZSBmb2xsb3dpbmcgbWV0cmljc1xuICAgICAqIGFyZSB0aGUgbWV0cmljcyBmb3IgZWFjaCBvcGVyYXRpb24gaW5jbHVkZWQgaW4gdGhlIHJlcXVlc3QgYXZhaWxhYmlsaXR5IG1ldHJpYyBwcm9wcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxTZXJ2aWNlQXZhaWxhYmlsaXR5TWV0cmljcyhwcm9wczogU2VydmljZUF2YWlsYWJpbGl0eU1ldHJpY1Byb3BzKTogSU1ldHJpY1tdXG4gICAge1xuICAgICAgICBsZXQgdXNpbmdNZXRyaWNzOiB7W2tleTogc3RyaW5nXTogSU1ldHJpY30gPSB7fTtcbiAgICAgICAgbGV0IG9wZXJhdGlvbk1ldHJpY3M6IElNZXRyaWNbXSA9IFtdO1xuICAgICAgICBsZXQgY291bnRlcjogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICBwcm9wcy5hdmFpbGFiaWxpdHlNZXRyaWNQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5UHJlZml4OiBzdHJpbmcgPSAoKHByb3Aua2V5UHJlZml4ID09PSB1bmRlZmluZWQgfHwgcHJvcC5rZXlQcmVmaXggPT0gXCJcIikgPyBcIlwiIDogcHJvcC5rZXlQcmVmaXgudG9Mb3dlckNhc2UoKSArIFwiX1wiKSArIFxuICAgICAgICAgICAgICAgIC8vcHJvcC5tZXRyaWNEZXRhaWxzLm9wZXJhdGlvbi5zZXJ2aWNlLnNlcnZpY2VOYW1lLnRvTG93ZXJDYXNlKCkgKyBcIl9cIiArXG4gICAgICAgICAgICAgICAgcHJvcC5tZXRyaWNEZXRhaWxzLm9wZXJhdGlvbk5hbWUudG9Mb3dlckNhc2UoKSArIFwiX1wiICtcbiAgICAgICAgICAgICAgICBwcm9wLm1ldHJpY1R5cGUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgem9uYWxPcGVyYXRpb25BdmFpbGFiaWxpdHlNZXRyaWM6IElNZXRyaWMgPSB0aGlzLmNyZWF0ZVpvbmFsQXZhaWxhYmlsaXR5TWV0cmljKHByb3AgYXMgWm9uYWxBdmFpbGFiaWxpdHlNZXRyaWNQcm9wcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wZXJhdGlvbk1ldHJpY3MucHVzaCh6b25hbE9wZXJhdGlvbkF2YWlsYWJpbGl0eU1ldHJpYyk7XG4gICAgICAgICAgICB1c2luZ01ldHJpY3NbYCR7a2V5UHJlZml4fSR7Y291bnRlcisrfWBdID0gem9uYWxPcGVyYXRpb25BdmFpbGFiaWxpdHlNZXRyaWM7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBleHByZXNzaW9uOiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIHN3aXRjaCAocHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHNbMF0ubWV0cmljVHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2FzZSBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlNVQ0NFU1NfUkFURTpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9KSAvICR7cHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHMubGVuZ3RofWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuUkVRVUVTVF9DT1VOVDpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCR7T2JqZWN0LmtleXModXNpbmdNZXRyaWNzKS5qb2luKFwiK1wiKX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLkZBVUxUX0NPVU5UOlxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgJHtPYmplY3Qua2V5cyh1c2luZ01ldHJpY3MpLmpvaW4oXCIrXCIpfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEF2YWlsYWJpbGl0eU1ldHJpY1R5cGUuRkFVTFRfUkFURTpcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gYCgke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9KSAvICR7cHJvcHMuYXZhaWxhYmlsaXR5TWV0cmljUHJvcHMubGVuZ3RofWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgICAgIFxuICAgICAgICAgICAgY2FzZSBBdmFpbGFiaWxpdHlNZXRyaWNUeXBlLlNVQ0NFU1NfQ09VTlQ6XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGAke09iamVjdC5rZXlzKHVzaW5nTWV0cmljcykuam9pbihcIitcIil9YDtcbiAgICAgICAgICAgICAgICBicmVhazsgICAgICBcbiAgICAgICAgfVxuICAgICAgICBsZXQgbWF0aDogSU1ldHJpYyA9IG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICB1c2luZ01ldHJpY3M6IHVzaW5nTWV0cmljcyxcbiAgICAgICAgICAgIHBlcmlvZDogcHJvcHMucGVyaW9kLFxuICAgICAgICAgICAgbGFiZWw6IHByb3BzLmxhYmVsLFxuICAgICAgICAgICAgZXhwcmVzc2lvbjogZXhwcmVzc2lvblxuICAgICAgICB9KTtcblxuICAgICAgICBvcGVyYXRpb25NZXRyaWNzLnNwbGljZSgwLCAwLCBtYXRoKTtcblxuICAgICAgICByZXR1cm4gb3BlcmF0aW9uTWV0cmljcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgcmVnaW9uYWwgZmF1bHQgY291bnQgbWV0cmljIHVzaW5nIDV4eCB0YXJnZXQgYW5kIGxvYWQgYmFsYW5jZXJcbiAgICAgKiBtZXRyaWNzIGFnYWluc3QgdG90YWwgcmVxdWVzdHMgZm9yIHRoZSBzcGVjaWZpZWQgbG9hZCBiYWxhbmNlclxuICAgICAqIEBwYXJhbSBwZXJpb2QgXG4gICAgICogQHBhcmFtIGxvYWRCYWxhbmNlckZ1bGxOYW1lIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVSZWdpb25hbEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyRmF1bHRSYXRlTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lOiBzdHJpbmcsIHBlcmlvZDogRHVyYXRpb24pOiBJTWV0cmljXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IE1hdGhFeHByZXNzaW9uKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb246IFwiKChtMSArIG0yKSAvIG0zKSAqIDEwMFwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiRmF1bHQgUmF0ZVwiLFxuICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICB1c2luZ01ldHJpY3M6IHtcbiAgICAgICAgICAgICAgICBcIm0xXCI6IG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljTmFtZTogXCJIVFRQQ29kZV9UYXJnZXRfNVhYX0NvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL0FwcGxpY2F0aW9uRUxCXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogbG9hZEJhbGFuY2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCI1eHhUYXJnZXRcIlxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFwibTJcIjogbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNOYW1lOiBcIkhUVFBDb2RlX0VMQl81WFhfQ291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogXCJBV1MvQXBwbGljYXRpb25FTEJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHBlcmlvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkxvYWRCYWxhbmNlclwiOiBsb2FkQmFsYW5jZXJGdWxsTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIjV4eEVMQlwiXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXCJtM1wiOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWU6IFwiUmVxdWVzdENvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL0FwcGxpY2F0aW9uRUxCXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogbG9hZEJhbGFuY2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJSZXF1ZXN0c1wiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHpvbmFsIGZhdWx0IGNvdW50IG1ldHJpYyB1c2luZyA1eHggdGFyZ2V0IGFuZCBsb2FkIGJhbGFuY2VyXG4gICAgICogbWV0cmljcyBhZ2FpbnN0IHRvdGFsIHJlcXVlc3RzIGZvciB0aGUgc3BlY2lmaWVkIGxvYWQgYmFsYW5jZXJcbiAgICAgKiBAcGFyYW0gbG9hZEJhbGFuY2VyRnVsbE5hbWVcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZU5hbWUgXG4gICAgICogQHBhcmFtIHBlcmlvZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlckZhdWx0UmF0ZU1ldHJpYyhsb2FkQmFsYW5jZXJGdWxsTmFtZTogc3RyaW5nLCBhdmFpbGFiaWxpdHlab25lTmFtZTogc3RyaW5nLCBwZXJpb2Q6IER1cmF0aW9uKTogSU1ldHJpY1xuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRoRXhwcmVzc2lvbih7XG4gICAgICAgICAgICBleHByZXNzaW9uOiBcIigobTEgKyBtMikgLyBtMykgKiAxMDBcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIkZhdWx0IFJhdGVcIixcbiAgICAgICAgICAgIHBlcmlvZDogcGVyaW9kLFxuICAgICAgICAgICAgdXNpbmdNZXRyaWNzOiB7XG4gICAgICAgICAgICAgICAgXCJtMVwiOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWU6IFwiSFRUUENvZGVfVGFyZ2V0XzVYWF9Db3VudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBcIkFXUy9BcHBsaWNhdGlvbkVMQlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogVW5pdC5DT1VOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcGVyaW9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTG9hZEJhbGFuY2VyXCI6IGxvYWRCYWxhbmNlckZ1bGxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXZhaWxhYmlsaXR5Wm9uZVwiOiBhdmFpbGFiaWxpdHlab25lTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIjV4eFRhcmdldFwiXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXCJtMlwiOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWU6IFwiSFRUUENvZGVfRUxCXzVYWF9Db3VudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBcIkFXUy9BcHBsaWNhdGlvbkVMQlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogVW5pdC5DT1VOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogcGVyaW9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTG9hZEJhbGFuY2VyXCI6IGxvYWRCYWxhbmNlckZ1bGxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXZhaWxhYmlsaXR5Wm9uZVwiOiBhdmFpbGFiaWxpdHlab25lTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIjV4eEVMQlwiXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXCJtM1wiOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY05hbWU6IFwiUmVxdWVzdENvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL0FwcGxpY2F0aW9uRUxCXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogbG9hZEJhbGFuY2VyRnVsbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBdmFpbGFiaWxpdHlab25lXCI6IGF2YWlsYWJpbGl0eVpvbmVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiUmVxdWVzdHNcIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSByZWdpb25hbCBwcm9jZXNzZWQgYnl0ZXMgbWV0cmljIGZvciB0aGUgc3BlY2lmaWVkIGxvYWQgYmFsYW5jZXJcbiAgICAgKiBAcGFyYW0gbG9hZEJhbGFuY2VyRnVsbE5hbWUgXG4gICAgICogQHBhcmFtIHBlcmlvZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlUmVnaW9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlclByb2Nlc3NlZEJ5dGVzTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lOiBzdHJpbmcsIHBlcmlvZDogRHVyYXRpb24pOiBJTWV0cmljXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBtZXRyaWNOYW1lOiBcIlByb2Nlc3NlZEJ5dGVzXCIsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL0FwcGxpY2F0aW9uRUxCXCIsXG4gICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogbG9hZEJhbGFuY2VyRnVsbE5hbWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYWJlbDogXCJQcm9jZXNzZWRCeXRlc1wiXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHpvbmFsIHByb2Nlc3NlZCBieXRlcyBtZXRyaWMgZm9yIHRoZSBzcGVjaWZpZWQgbG9hZCBiYWxhbmNlclxuICAgICAqIEBwYXJhbSBsb2FkQmFsYW5jZXJGdWxsTmFtZSBcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmlsaXR5Wm9uZU5hbWUgXG4gICAgICogQHBhcmFtIHBlcmlvZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlWm9uYWxBcHBsaWNhdGlvbkxvYWRCYWxhbmNlclByb2Nlc3NlZEJ5dGVzTWV0cmljKGxvYWRCYWxhbmNlckZ1bGxOYW1lOiBzdHJpbmcsIGF2YWlsYWJpbGl0eVpvbmVOYW1lOiBzdHJpbmcsIHBlcmlvZDogRHVyYXRpb24pOiBJTWV0cmljXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBtZXRyaWNOYW1lOiBcIlByb2Nlc3NlZEJ5dGVzXCIsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IFwiQVdTL0FwcGxpY2F0aW9uRUxCXCIsXG4gICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgcGVyaW9kOiBwZXJpb2QsXG4gICAgICAgICAgICBzdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgICAgXCJMb2FkQmFsYW5jZXJcIjogbG9hZEJhbGFuY2VyRnVsbE5hbWUsXG4gICAgICAgICAgICAgICAgXCJBdmFpbGFiaWxpdHlab25lXCI6IGF2YWlsYWJpbGl0eVpvbmVOYW1lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGFiZWw6IFwiUHJvY2Vzc2VkQnl0ZXNcIlxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluY3JlbWVudHMgYSBzdHIgYnkgb25lIGNoYXIsIGZvciBleGFtcGxlXG4gICAgICogYSAtPiBiXG4gICAgICogeiAtPiBhYVxuICAgICAqIGFkIC0+IGFlXG4gICAgICogXG4gICAgICogVGhpcyB3cmFwcyBhdCB6IGFuZCBhZGRzIGEgbmV3ICdhJ1xuICAgICAqIEBwYXJhbSBzdHIgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc3RhdGljIG5leHRDaGFyKHN0cjogc3RyaW5nKTogc3RyaW5nIFxuICAgIHtcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICdhJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2hhckE6IHN0cmluZ1tdID0gc3RyLnNwbGl0KCcnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjaGFyQVtjaGFyQS5sZW5ndGggLSAxXSA9PT0gJ3onKSBcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIEF2YWlsYWJpbGl0eUFuZExhdGVuY3lNZXRyaWNzLm5leHRDaGFyKHN0ci5zdWJzdHJpbmcoMCwgY2hhckEubGVuZ3RoIC0gMSkpICsgJ2EnO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIFxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLnN1YnN0cmluZygwLCBjaGFyQS5sZW5ndGggLSAxKSArXG4gICAgICAgICAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQVtjaGFyQS5sZW5ndGggLSAxXS5jaGFyQ29kZUF0KDApICsgMSk7XG4gICAgICAgIH1cbiAgICB9XG59Il19