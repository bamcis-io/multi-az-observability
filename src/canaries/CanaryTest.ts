import { Construct } from "constructs";
import { ICanaryTestProps } from "./props/ICanaryTestProps";
import { IRule, Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Fn } from "aws-cdk-lib";

export class CanaryTest extends Construct
{
    timedEventRules: {[key: string]: IRule};

    constructor(scope: Construct, id: string, props: ICanaryTestProps)
    {
        super(scope, id);
        this.timedEventRules = {};

        props.availabilityZoneIds.forEach((availabilityZoneId, index) => {
            let availabilityZoneName: string = props.availabilityZoneMapper.availabilityZoneName(availabilityZoneId);

            let scheme: string =  props.operation.service.baseUrl.split(":")[0]
            let url: string = scheme + "://" + availabilityZoneName + "." + props.loadBalancer.loadBalancerDnsName + props.operation.path;

            let data: {[key: string]: any} = {
                "parameters": {
                    "methods": props.operation.httpMethods,
                    "url": url,
                    "postData": props.postData,
                    "headers": props.headers,
                    "operation": props.operation.operationName,
                    "faultBoundaryId": availabilityZoneId,
                    "faultBoundary": "az",
                    "metricNamespace": props.operation.canaryMetricDetails?.canaryAvailabilityMetricDetails.metricNamespace,
                    "requestCount": props.requestCount
                }
            }
    
            this.timedEventRules[availabilityZoneId] = new Rule(this, "AZ" + index + props.operation.operationName + "TimedEvent", {
                schedule: Schedule.expression(props.schedule),
                enabled: true,
                targets: [ 
                    new LambdaFunction(props.function, { event: RuleTargetInput.fromObject(data)})
                ]
            });
        });

        let data: {[key: string]: any} = {
            "parameters": {
                "methods": props.operation.httpMethods,
                "url": props.operation.service.baseUrl.toString() + props.operation.path,
                "postData": props.postData,
                "headers": props.headers,
                "operation": props.operation.operationName,
                "faultBoundaryId": Fn.ref("AWS::Region"),
                "faultBoundary": "region",
                "metricNamespace": props.operation.canaryMetricDetails?.canaryAvailabilityMetricDetails.metricNamespace,
                "requestCount": props.requestCount
            }
        }

        this.timedEventRules[Fn.ref("AWS::Region")] = new Rule(this, "RegionalTimedEvent", {
            schedule: Schedule.expression(props.schedule),
            enabled: true,
            targets: [ 
                new LambdaFunction(props.function, { event: RuleTargetInput.fromObject(data)})
            ]
        });
    }
}