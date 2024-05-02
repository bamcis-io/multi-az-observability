import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { LatencyMetricType } from "../utilities/LatencyMetricType";
import { IAvailabilityMetricProps } from "./props/IAvailabilityMetricProps";
import { IRegionalAvailabilityMetricProps } from "./props/IRegionalAvailabilityMetricProps";
import { IZonalAvailabilityMetricProps } from "./props/IZonalAvailabilityMetricProps";
import { IMetric, Metric, MathExpression, Unit} from "aws-cdk-lib/aws-cloudwatch";
import { IZonalLatencyMetricProps } from "./props/IZonalLatencyMetricProps";
import { ILatencyMetricProps } from "./props/ILatencyMetricProps";
import { IRegionalLatencyMetricProps } from "./props/IRegionalLatencyMetricProps";
import { IServiceAvailabilityMetricProps } from "./props/IServiceAvailabilityMetricProps";
import { Duration, Fn } from "aws-cdk-lib";

/**
 * Class for creating availability and latency metrics that can be used in alarms and graphs
 */
export class AvailabilityAndLatencyMetrics
{
    /**
     * Creates a zonal availability metric
     * @param props 
     * @returns 
     */
    static createZonalAvailabilityMetric(props: IZonalAvailabilityMetricProps): IMetric
    {
        return this.createAvailabilityMetric(props, props.metricDetails.getZonalDimensions(props.availabilityZoneId, Fn.ref("AWS::Region")));
    }

    /**
     * Creates a regional availability metric
     * @param props 
     * @returns 
     */
    static createRegionalAvailabilityMetric(props: IRegionalAvailabilityMetricProps): IMetric
    {
        return this.createAvailabilityMetric(props, props.metricDetails.getRegionalDimensions(Fn.ref("AWS::Region")));
    }

    /**
     * General purpose method to create availability metrics
     * @param props 
     * @param dimensions 
     * @returns 
     */
    private static createAvailabilityMetric(props: IAvailabilityMetricProps, dimensions: {[key: string]: string}): IMetric
    {
        let counter: number = 0;
        let key: string = "";

        let usingMetrics: {[key: string]: IMetric} = {};

        let successKeys: string[] = [];
        let faultKeys: string[] = [];

        if (props.metricDetails.successMetricNames !== undefined && props.metricType != AvailabilityMetricType.FAULT_COUNT)
        {
            props.metricDetails.successMetricNames.forEach((successMetric) => {
                let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == "") ? "" : props.keyPrefix.toLowerCase() + "_") + 
                    props.metricDetails.operation.operationName.toLowerCase() + "_" + 
                    successMetric.toLowerCase();

                key = keyPrefix + "_" + counter++;
                successKeys.push(key);

                usingMetrics[key] = new Metric({
                    namespace: props.metricDetails.namespace,
                    metricName: successMetric,
                    unit: props.metricDetails.unit,
                    period: props.metricDetails.period,
                    statistic: props.metricDetails.alarmStatistic,
                    dimensionsMap: dimensions,
                    label: successMetric
                });
            })
        }

        if (props.metricDetails.faultMetricNames !== undefined && props.metricType != AvailabilityMetricType.SUCCESS_COUNT)
        {
            props.metricDetails.faultMetricNames.forEach((faultMetric) => {
                let keyPrefix = ((props.keyPrefix === undefined || props.keyPrefix == "") ? "" : props.keyPrefix.toLowerCase() + "_") + 
                    props.metricDetails.operation.operationName.toLowerCase() + "_" + 
                    faultMetric.toLowerCase();

                key = keyPrefix + "_" + counter++;
                faultKeys.push(key);

                usingMetrics[key] = new Metric({
                    namespace: props.metricDetails.namespace,
                    metricName: faultMetric,
                    unit: props.metricDetails.unit,
                    period: props.metricDetails.period,
                    statistic: props.metricDetails.alarmStatistic,
                    dimensionsMap: dimensions,
                    label: faultMetric
                });
            })
        }

        let expression: string = "";

        switch (props.metricType)
        {
            case AvailabilityMetricType.SUCCESS_RATE:
                expression = `((${successKeys.join("+")}) / (${successKeys.join("+")}+${faultKeys.join("+")})) * 100`;
                break;
            case AvailabilityMetricType.REQUEST_COUNT:
                expression = `${successKeys.join("+")}+${faultKeys.join("+")}`;
                break;
            case AvailabilityMetricType.FAULT_COUNT:
                expression = `(${faultKeys.join("+")})`;
                break;
            case AvailabilityMetricType.FAULT_RATE:
                expression = `((${faultKeys.join("+")}) / (${successKeys.join("+")}+${faultKeys.join("+")})) * 100`;
                break;
            case AvailabilityMetricType.SUCCESS_COUNT:
                expression = `(${successKeys.join("+")})`;
                break;
        }

        return new MathExpression({
            expression: expression,
            label: props.label,
            period: props.metricDetails.period,
            usingMetrics: usingMetrics
        })
    }

    /**
     * Creates a zonal latency metric
     * @param props 
     * @returns 
     */
    static createZonalLatencyMetrics(props: IZonalLatencyMetricProps): IMetric[]
    {
        return this.createLatencyMetrics(props, props.metricDetails.getZonalDimensions(props.availabilityZoneId, Fn.ref("AWS::Region")));
    }

    /**
     * Creates a regional latency metric
     * @param props 
     * @returns 
     */
    static createRegionalLatencyMetrics(props: IRegionalLatencyMetricProps): IMetric[]
    {
        return this.createLatencyMetrics(props, props.metricDetails.getRegionalDimensions(Fn.ref("AWS::Region")));
    }

    /**
     * General purpose method to create latency metrics
     * @param props 
     * @param dimensions 
     * @returns 
     */
    private static createLatencyMetrics(props: ILatencyMetricProps, dimensions: {[key: string]: string}): IMetric[]
    {
        let names: string[];

        switch (props.metricType)
        {
            default:
            case LatencyMetricType.SUCCESS_LATENCY:
                names = props.metricDetails.successMetricNames;
                break;                
            case LatencyMetricType.FAULT_LATENCY:
                names = props.metricDetails.faultMetricNames;
                break;
        }

        return names.map(x => new Metric({
            metricName: x,
            namespace: props.metricDetails.namespace,
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
    static createRegionalServiceAvailabilityMetrics(props: IServiceAvailabilityMetricProps): IMetric[]
    {
        let usingMetrics: {[key: string]: IMetric} = {};
        let operationMetrics: IMetric[] = [];
        let counter: number = 0;
            
        props.availabilityMetricProps.forEach(prop => {
            
            let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == "") ? "" : prop.keyPrefix.toLowerCase() + "_") + 
                prop.metricDetails.operation.service.serviceName.toLowerCase() + "_" +
                prop.metricDetails.operation.operationName.toLowerCase() + "_" +
                prop.metricType.toString().toLowerCase();
            
            let regionalOperationAvailabilityMetric: IMetric = this.createRegionalAvailabilityMetric(prop as IRegionalAvailabilityMetricProps);
            
            operationMetrics.push(regionalOperationAvailabilityMetric);
            usingMetrics[`"${keyPrefix}${counter++}`] = regionalOperationAvailabilityMetric;
        });

        let expression: string = "";

        switch (props.availabilityMetricProps[0].metricType)
        {
            case AvailabilityMetricType.SUCCESS_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;
            case AvailabilityMetricType.REQUEST_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType.FAULT_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType.FAULT_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;       
            case AvailabilityMetricType.SUCCESS_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;      
        }
        let math: IMetric = new MathExpression({
            usingMetrics: usingMetrics,
            period: props.period,
            label: props.label,
            expression: expression
        });

        operationMetrics.splice(0, 0, math);

        return operationMetrics;
    }

    /**
     * Creates a zonal service level availability metrics, one metric for
     * each operation at the zonal level and the service.
     * @param props 
     * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
     * are the metrics for each operation included in the request availability metric props.
     */
    static createZonalServiceAvailabilityMetrics(props: IServiceAvailabilityMetricProps): IMetric[]
    {
        let usingMetrics: {[key: string]: IMetric} = {};
        let operationMetrics: IMetric[] = [];
        let counter: number = 0;
            
        props.availabilityMetricProps.forEach(prop => {
            
            let keyPrefix: string = ((prop.keyPrefix === undefined || prop.keyPrefix == "") ? "" : prop.keyPrefix.toLowerCase() + "_") + 
                prop.metricDetails.operation.service.serviceName.toLowerCase() + "_" +
                prop.metricDetails.operation.operationName.toLowerCase() + "_" +
                prop.metricType.toString().toLowerCase();
            
            let zonalOperationAvailabilityMetric: IMetric = this.createZonalAvailabilityMetric(prop as IZonalAvailabilityMetricProps);
            
            operationMetrics.push(zonalOperationAvailabilityMetric);
            usingMetrics[`"${keyPrefix}${counter++}`] = zonalOperationAvailabilityMetric;
        });

        let expression: string = "";

        switch (props.availabilityMetricProps[0].metricType)
        {
            case AvailabilityMetricType.SUCCESS_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;
            case AvailabilityMetricType.REQUEST_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType.FAULT_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;
            case AvailabilityMetricType.FAULT_RATE:
                expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
                break;       
            case AvailabilityMetricType.SUCCESS_COUNT:
                expression = `${Object.keys(usingMetrics).join("+")}`;
                break;      
        }
        let math: IMetric = new MathExpression({
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
    static createRegionalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName: string, period: Duration): IMetric
    {
        return new MathExpression({
            expression: "((m1 + m2) / m3) * 100",
            label: "Fault Rate",
            period: period,
            usingMetrics: {
                "m1": new Metric({
                        metricName: "HTTPCode_Target_5XX_Count",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
                        period: period,
                        statistic: "Sum",
                        dimensionsMap: {
                            "LoadBalancer": loadBalancerFullName
                        },
                        label: "5xxTarget"
                }),
                "m2": new Metric({
                        metricName: "HTTPCode_ELB_5XX_Count",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
                        period: period,
                        statistic: "Sum",
                        dimensionsMap: {
                            "LoadBalancer": loadBalancerFullName
                        },
                        label: "5xxELB"
                }),
                "m3": new Metric({
                        metricName: "RequestCount",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
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
    static createZonalApplicationLoadBalancerFaultRateMetric(loadBalancerFullName: string, availabilityZoneName: string, period: Duration): IMetric
    {
        return new MathExpression({
            expression: "((m1 + m2) / m3) * 100",
            label: "Fault Rate",
            period: period,
            usingMetrics: {
                "m1": new Metric({
                        metricName: "HTTPCode_Target_5XX_Count",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
                        period: period,
                        statistic: "Sum",
                        dimensionsMap: {
                            "LoadBalancer": loadBalancerFullName,
                            "AvailabilityZone": availabilityZoneName
                        },
                        label: "5xxTarget"
                }),
                "m2": new Metric({
                        metricName: "HTTPCode_ELB_5XX_Count",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
                        period: period,
                        statistic: "Sum",
                        dimensionsMap: {
                            "LoadBalancer": loadBalancerFullName,
                            "AvailabilityZone": availabilityZoneName
                        },
                        label: "5xxELB"
                }),
                "m3": new Metric({
                        metricName: "RequestCount",
                        namespace: "AWS/ApplicationELB",
                        unit: Unit.COUNT,
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
    static createRegionalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName: string, period: Duration): IMetric
    {
        return new Metric({
            metricName: "ProcessedBytes",
            namespace: "AWS/ApplicationELB",
            unit: Unit.COUNT,
            period: period,
            statistic: "Sum",
            dimensionsMap: {
                "LoadBalancer": loadBalancerFullName
            },
            label: "ProcessedBytes"
        })
    }

    /**
     * Creates a zonal processed bytes metric for the specified load balancer
     * @param loadBalancerFullName 
     * @param availabilityZoneName 
     * @param period 
     * @returns 
     */
    static createZonalApplicationLoadBalancerProcessedBytesMetric(loadBalancerFullName: string, availabilityZoneName: string, period: Duration): IMetric
    {
        return new Metric({
            metricName: "ProcessedBytes",
            namespace: "AWS/ApplicationELB",
            unit: Unit.COUNT,
            period: period,
            statistic: "Sum",
            dimensionsMap: {
                "LoadBalancer": loadBalancerFullName,
                "AvailabilityZone": availabilityZoneName
            },
            label: "ProcessedBytes"
        })
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
    static nextChar(str: string): string 
    {
        if (str.length == 0) {
            return 'a';
        }
        let charA: string[] = str.split('');
        
        if (charA[charA.length - 1] === 'z') 
        {
            return AvailabilityAndLatencyMetrics.nextChar(str.substring(0, charA.length - 1)) + 'a';
        } 
        else 
        {
            return str.substring(0, charA.length - 1) +
                String.fromCharCode(charA[charA.length - 1].charCodeAt(0) + 1);
        }
    }
}