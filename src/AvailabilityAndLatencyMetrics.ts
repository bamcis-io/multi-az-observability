import { AvailabilityMetricType } from "./AvailabilityMetricType";
import { LatencyMetricType } from "./LatencyMetricType";
import { IAvailabilityMetricProps } from "./IAvailabilityMetricProps";
import { IRegionalAvailabilityMetricProps } from "./IRegionalAvailabilityMetricProps";
import { IZonalAvailabilityMetricProps } from "./IZonalAvailabilityMetricProps";
import { IMetric, Metric, MathExpression} from "aws-cdk-lib/aws-cloudwatch";
import { IZonalLatencyMetricProps } from "./IZonalLatencyMetricProps";
import { ILatencyMetricProps } from "./ILatencyMetricProps";
import { IRegionalLatencyMetricProps } from "./IRegionalLatencyMetricProps";
import { IServiceAvailabilityMetricProps } from "./IServiceAvailabilityMetricProps";

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
        return this.createAvailabilityMetric(props, props.metricDetails.getZonalDimensions(props.availabilityZoneId, props.region));
    }

    /**
     * Creates a regional availability metric
     * @param props 
     * @returns 
     */
    static createRegionalAvailabilityMetric(props: IRegionalAvailabilityMetricProps): IMetric
    {
        return this.createAvailabilityMetric(props, props.metricDetails.getRegionalDimensions(props.region));
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
                    successMetric.toLowerCase() + "_" + 
                    props.metricScope.toString().toLowerCase();

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
                    faultMetric.toLowerCase() + "_" + 
                    props.metricScope.toString().toLowerCase();

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
        return this.createLatencyMetrics(props, props.metricDetails.getZonalDimensions(props.availabilityZoneId, props.region));
    }

    /**
     * Creates a regional latency metric
     * @param props 
     * @returns 
     */
    static createRegionalLatencyMetrics(props: IRegionalLatencyMetricProps): IMetric[]
    {
        return this.createLatencyMetrics(props, props.metricDetails.getRegionalDimensions(props.region));
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
            label: x
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
                prop.metricType.toString().toLowerCase() + "_" +
                prop.metricScope.toString().toLowerCase();
            
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
                prop.metricType.toString().toLowerCase() + "_" +
                prop.metricScope.toString().toLowerCase();
            
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
}