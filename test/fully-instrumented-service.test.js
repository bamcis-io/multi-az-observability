"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_elasticloadbalancingv2_1 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const MultiAvailabilityZoneObservability_1 = require("../src/MultiAvailabilityZoneObservability");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const Service_1 = require("../src/services/Service");
const Operation_1 = require("../src/services/Operation");
test('Fully instrumented service', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    let azs = [
        cdk.Fn.ref("AWS::Region") + "a",
        cdk.Fn.ref("AWS::Region") + "b",
        cdk.Fn.ref("AWS::Region") + "c",
    ];
    let vpc = new aws_ec2_1.Vpc(stack, "vpc", {
        availabilityZones: azs,
        subnetConfiguration: [
            {
                subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS,
                name: "private_with_egress_subnets",
                cidrMask: 24
            }
        ],
        createInternetGateway: false,
        natGateways: 0
    });
    let subnets = vpc.selectSubnets({
        subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS
    });
    let service = new Service_1.Service({
        serviceName: "test",
        availabilityZoneNames: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: aws_cdk_lib_1.Duration.seconds(60),
    });
    let logGroup = new aws_logs_1.LogGroup(stack, "Logs", {});
    let rideOperation = new Operation_1.Operation({
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: ["GET"],
        serverSideContributorInsightRuleDetails: {
            logGroups: [logGroup],
            successLatencyMetricJsonPath: "$.SuccessLatency",
            faultMetricJsonPath: "$.Faults",
            operationNameJsonPath: "$.Operation",
            instanceIdJsonPath: "$.InstanceId",
            availabilityZoneIdJsonPath: "$.AZ-ID"
        },
        serverSideAvailabilityMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["Success"],
            faultMetricNames: ["Fault", "Error"],
            alarmStatistic: "Sum",
            unit: aws_cloudwatch_1.Unit.COUNT,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: ["Sum"],
            graphedSuccessStatistics: ["Sum"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    };
                }
            }
        }),
        serverSideLatencyMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["SuccessLatency"],
            faultMetricNames: ["FaultLatency"],
            alarmStatistic: "p99",
            unit: aws_cloudwatch_1.Unit.MILLISECONDS,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: ["p99"],
            graphedSuccessStatistics: ["p50", "p99", "tm99"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    };
                }
            }
        })
    });
    service.addOperation(rideOperation);
    new MultiAvailabilityZoneObservability_1.MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboards: true,
            loadBalancer: new aws_elasticloadbalancingv2_1.ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            interval: aws_cdk_lib_1.Duration.minutes(30)
        }
    });
    assertions_1.Template.fromStack(stack);
});
test('Fully instrumented service adding canaries', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    let azs = [
        cdk.Fn.ref("AWS::Region") + "a",
        cdk.Fn.ref("AWS::Region") + "b",
        cdk.Fn.ref("AWS::Region") + "c",
    ];
    let vpc = new aws_ec2_1.Vpc(stack, "vpc", {
        availabilityZones: azs,
        subnetConfiguration: [
            {
                subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS,
                name: "private_with_egress_subnets",
                cidrMask: 24
            }
        ],
        createInternetGateway: false,
        natGateways: 0
    });
    let subnets = vpc.selectSubnets({
        subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS
    });
    let loadbalancer = new aws_elasticloadbalancingv2_1.ApplicationLoadBalancer(stack, "alb", {
        vpc: vpc,
        crossZoneEnabled: false,
        vpcSubnets: subnets
    });
    let service = new Service_1.Service({
        serviceName: "test",
        availabilityZoneNames: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: aws_cdk_lib_1.Duration.seconds(60)
    });
    let logGroup = new aws_logs_1.LogGroup(stack, "Logs", {});
    let rideOperation = {
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: ["GET"],
        serverSideContributorInsightRuleDetails: {
            logGroups: [logGroup],
            successLatencyMetricJsonPath: "$.SuccessLatency",
            faultMetricJsonPath: "$.Faults",
            operationNameJsonPath: "$.Operation",
            instanceIdJsonPath: "$.InstanceId",
            availabilityZoneIdJsonPath: "$.AZ-ID"
        },
        serverSideAvailabilityMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["Success"],
            faultMetricNames: ["Fault", "Error"],
            alarmStatistic: "Sum",
            unit: aws_cloudwatch_1.Unit.COUNT,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: ["Sum"],
            graphedSuccessStatistics: ["Sum"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    };
                }
            }
        }),
        serverSideLatencyMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["SuccessLatency"],
            faultMetricNames: ["FaultLatency"],
            alarmStatistic: "p99",
            unit: aws_cloudwatch_1.Unit.MILLISECONDS,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: ["p99"],
            graphedSuccessStatistics: ["p50", "p99", "tm99"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    };
                }
            }
        }),
        canaryTestProps: {
            requestCount: 10,
            schedule: "rate(1 minute)",
            loadBalancer: loadbalancer
        }
    };
    let payOperation = {
        operationName: "pay",
        service: service,
        path: "/pay",
        isCritical: true,
        httpMethods: ["GET"],
        serverSideContributorInsightRuleDetails: {
            logGroups: [logGroup],
            successLatencyMetricJsonPath: "$.SuccessLatency",
            faultMetricJsonPath: "$.Faults",
            operationNameJsonPath: "$.Operation",
            instanceIdJsonPath: "$.InstanceId",
            availabilityZoneIdJsonPath: "$.AZ-ID"
        },
        serverSideAvailabilityMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "pay",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["Success"],
            faultMetricNames: ["Fault", "Error"],
            alarmStatistic: "Sum",
            unit: aws_cloudwatch_1.Unit.COUNT,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: ["Sum"],
            graphedSuccessStatistics: ["Sum"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "pay"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "pay"
                    };
                }
            }
        }),
        serverSideLatencyMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
            operationName: "pay",
            metricNamespace: "front-end/metrics",
            successMetricNames: ["SuccessLatency"],
            faultMetricNames: ["FaultLatency"],
            alarmStatistic: "p99",
            unit: aws_cloudwatch_1.Unit.MILLISECONDS,
            period: aws_cdk_lib_1.Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: ["p99"],
            graphedSuccessStatistics: ["p50", "p99", "tm99"],
            metricDimensions: {
                zonalDimensions(availabilityZoneId, region) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "pay"
                    };
                },
                regionalDimensions(region) {
                    return {
                        "Region": region,
                        "Operation": "pay"
                    };
                }
            }
        }),
        canaryTestProps: {
            requestCount: 10,
            schedule: "rate(1 minute)",
            loadBalancer: loadbalancer
        }
    };
    service.addOperation(rideOperation);
    service.addOperation(payOperation);
    new MultiAvailabilityZoneObservability_1.MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboards: true,
            loadBalancer: loadbalancer,
            service: service,
            outlierThreshold: 0.7,
            interval: aws_cdk_lib_1.Duration.minutes(30)
        }
    });
    assertions_1.Template.fromStack(stack);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVsbHktaW5zdHJ1bWVudGVkLXNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZ1bGx5LWluc3RydW1lbnRlZC1zZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBbUM7QUFDbkMsdURBQWtEO0FBQ2xELGlEQUF1RTtBQUN2RSx1RkFBa0c7QUFDbEcsa0dBQXVIO0FBQ3ZILDZDQUF1QztBQUd2QywrREFBa0Q7QUFDbEQsbURBQTJEO0FBQzNELHFEQUFrRDtBQUNsRCx5REFBc0Q7QUFFdEQsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtJQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRTlDLElBQUksR0FBRyxHQUFhO1FBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUc7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRztRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHO0tBQ2xDLENBQUE7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLGFBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO1FBQzVCLGlCQUFpQixFQUFFLEdBQUc7UUFDdEIsbUJBQW1CLEVBQUU7WUFDakI7Z0JBQ0ksVUFBVSxFQUFFLG9CQUFVLENBQUMsbUJBQW1CO2dCQUMxQyxJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxRQUFRLEVBQUUsRUFBRTthQUNmO1NBQ0o7UUFDRCxxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLFdBQVcsRUFBRSxDQUFDO0tBQ2pCLENBQUMsQ0FBQztJQUdILElBQUksT0FB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T0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVuQyxJQUFJLHVFQUFrQyxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRTtRQUM5RCxxQ0FBcUMsRUFBRTtZQUNuQyxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSxZQUFZO1lBQzFCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGdCQUFnQixFQUFFLEdBQUc7WUFDckIsUUFBUSxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztTQUNqQztLQUNKLENBQUMsQ0FBQztJQUVILHFCQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJztcbmltcG9ydCB7IFNlbGVjdGVkU3VibmV0cywgU3VibmV0VHlwZSwgVnBjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgeyBBcHBsaWNhdGlvbkxvYWRCYWxhbmNlciwgSUxvYWRCYWxhbmNlclYyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0IHsgTXVsdGlBdmFpbGFiaWxpdHlab25lT2JzZXJ2YWJpbGl0eSwgT3BlcmF0aW9uTWV0cmljRGV0YWlscyB9IGZyb20gJy4uL3NyYy9NdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgSVNlcnZpY2UgfSBmcm9tICcuLi9zcmMvc2VydmljZXMvSVNlcnZpY2UnO1xuaW1wb3J0IHsgSU9wZXJhdGlvbiB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy9JT3BlcmF0aW9uJztcbmltcG9ydCB7IFVuaXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaCc7XG5pbXBvcnQgeyBJTG9nR3JvdXAsIExvZ0dyb3VwIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgU2VydmljZSB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy9TZXJ2aWNlJztcbmltcG9ydCB7IE9wZXJhdGlvbiB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy9PcGVyYXRpb24nO1xuXG50ZXN0KCdGdWxseSBpbnN0cnVtZW50ZWQgc2VydmljZScsICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IGNkay5TdGFjayhhcHAsIFwiVGVzdFN0YWNrXCIpO1xuXG4gICAgbGV0IGF6czogc3RyaW5nW10gPSBbXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiYVwiLFxuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImJcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJjXCIsXG4gICAgXVxuXG4gICAgbGV0IHZwYyA9IG5ldyBWcGMoc3RhY2ssIFwidnBjXCIsIHtcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZXM6IGF6cyxcbiAgICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgICAgICAgICBuYW1lOiBcInByaXZhdGVfd2l0aF9lZ3Jlc3Nfc3VibmV0c1wiLFxuICAgICAgICAgICAgICAgIGNpZHJNYXNrOiAyNFxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjcmVhdGVJbnRlcm5ldEdhdGV3YXk6IGZhbHNlLFxuICAgICAgICBuYXRHYXRld2F5czogMFxuICAgIH0pO1xuXG4gICAgXG4gICAgbGV0IHN1Ym5ldHM6IFNlbGVjdGVkU3VibmV0cyA9IHZwYy5zZWxlY3RTdWJuZXRzKHtcbiAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTXG4gICAgfSk7XG5cbiAgICBsZXQgc2VydmljZTogSVNlcnZpY2UgPSBuZXcgU2VydmljZSh7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBcInRlc3RcIixcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiB2cGMuYXZhaWxhYmlsaXR5Wm9uZXMsXG4gICAgICAgIGJhc2VVcmw6IFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbVwiLFxuICAgICAgICBmYXVsdENvdW50VGhyZXNob2xkOiAyNSxcbiAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICB9KTtcblxuICAgIGxldCBsb2dHcm91cDogSUxvZ0dyb3VwID0gbmV3IExvZ0dyb3VwKHN0YWNrLCBcIkxvZ3NcIiwge1xuICAgIH0pO1xuXG4gICAgbGV0IHJpZGVPcGVyYXRpb246IElPcGVyYXRpb24gPSBuZXcgT3BlcmF0aW9uKHtcbiAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgIHBhdGg6IFwiL3JpZGVcIixcbiAgICAgICAgaXNDcml0aWNhbDogdHJ1ZSxcbiAgICAgICAgaHR0cE1ldGhvZHM6IFsgXCJHRVRcIiBdLFxuICAgICAgICBzZXJ2ZXJTaWRlQ29udHJpYnV0b3JJbnNpZ2h0UnVsZURldGFpbHM6IHtcbiAgICAgICAgICAgIGxvZ0dyb3VwczogWyBsb2dHcm91cCBdLFxuICAgICAgICAgICAgc3VjY2Vzc0xhdGVuY3lNZXRyaWNKc29uUGF0aDogXCIkLlN1Y2Nlc3NMYXRlbmN5XCIsXG4gICAgICAgICAgICBmYXVsdE1ldHJpY0pzb25QYXRoOiBcIiQuRmF1bHRzXCIsXG4gICAgICAgICAgICBvcGVyYXRpb25OYW1lSnNvblBhdGg6IFwiJC5PcGVyYXRpb25cIixcbiAgICAgICAgICAgIGluc3RhbmNlSWRKc29uUGF0aDogXCIkLkluc3RhbmNlSWRcIixcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmVJZEpzb25QYXRoOiBcIiQuQVotSURcIlxuICAgICAgICB9LFxuICAgICAgICBzZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlsczogbmV3IE9wZXJhdGlvbk1ldHJpY0RldGFpbHMoe1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6IFwiZnJvbnQtZW5kL21ldHJpY3NcIixcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NcIiBdLFxuICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0XCIsIFwiRXJyb3JcIiBdLFxuICAgICAgICAgICAgYWxhcm1TdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiA1LFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IDk5LjksXG4gICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiAwLjEsXG4gICAgICAgICAgICBncmFwaGVkRmF1bHRTdGF0aXN0aWNzOiBbIFwiU3VtXCIgXSxcbiAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBzZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicmlkZVwiLFxuICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICBzdWNjZXNzTWV0cmljTmFtZXM6IFsgXCJTdWNjZXNzTGF0ZW5jeVwiIF0sXG4gICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcInA5OVwiLFxuICAgICAgICAgICAgdW5pdDogVW5pdC5NSUxMSVNFQ09ORFMsXG4gICAgICAgICAgICBwZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NBbGFybVRocmVzaG9sZDogMTAwLFxuICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMSxcbiAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJwOTlcIiBdLFxuICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBbIFwicDUwXCIsIFwicDk5XCIsIFwidG05OVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBzZXJ2aWNlLmFkZE9wZXJhdGlvbihyaWRlT3BlcmF0aW9uKTtcblxuICAgIG5ldyBNdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5KHN0YWNrLCBcIk1BWk9ic2VydmFiaWxpdHlcIiwge1xuICAgICAgICBpbnN0cnVtZW50ZWRTZXJ2aWNlT2JzZXJ2YWJpbGl0eVByb3BzOiB7XG4gICAgICAgICAgICBjcmVhdGVEYXNoYm9hcmRzOiB0cnVlLFxuICAgICAgICAgICAgbG9hZEJhbGFuY2VyOiBuZXcgQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIoc3RhY2ssIFwiYWxiXCIsIHtcbiAgICAgICAgICAgICAgICB2cGM6IHZwYyxcbiAgICAgICAgICAgICAgICBjcm9zc1pvbmVFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2cGNTdWJuZXRzOiBzdWJuZXRzXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiAwLjcsXG4gICAgICAgICAgICBpbnRlcnZhbDogRHVyYXRpb24ubWludXRlcygzMClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcbn0pO1xuXG50ZXN0KCdGdWxseSBpbnN0cnVtZW50ZWQgc2VydmljZSBhZGRpbmcgY2FuYXJpZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBjZGsuU3RhY2soYXBwLCBcIlRlc3RTdGFja1wiKTtcblxuICAgIGxldCBhenM6IHN0cmluZ1tdID0gW1xuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImFcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJiXCIsXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiY1wiLFxuICAgIF1cblxuICAgIGxldCB2cGMgPSBuZXcgVnBjKHN0YWNrLCBcInZwY1wiLCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBhenMsXG4gICAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdWJuZXRUeXBlOiBTdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJwcml2YXRlX3dpdGhfZWdyZXNzX3N1Ym5ldHNcIixcbiAgICAgICAgICAgICAgICBjaWRyTWFzazogMjRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlSW50ZXJuZXRHYXRld2F5OiBmYWxzZSxcbiAgICAgICAgbmF0R2F0ZXdheXM6IDBcbiAgICB9KTtcblxuICAgIGxldCBzdWJuZXRzOiBTZWxlY3RlZFN1Ym5ldHMgPSB2cGMuc2VsZWN0U3VibmV0cyh7XG4gICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTU1xuICAgIH0pO1xuXG4gICAgbGV0IGxvYWRiYWxhbmNlcjogSUxvYWRCYWxhbmNlclYyID0gbmV3IEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHN0YWNrLCBcImFsYlwiLCB7XG4gICAgICAgIHZwYzogdnBjLFxuICAgICAgICBjcm9zc1pvbmVFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgdnBjU3VibmV0czogc3VibmV0c1xuICAgIH0pO1xuICBcbiAgICBsZXQgc2VydmljZTogSVNlcnZpY2UgPSBuZXcgU2VydmljZSh7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBcInRlc3RcIixcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiB2cGMuYXZhaWxhYmlsaXR5Wm9uZXMsXG4gICAgICAgIGJhc2VVcmw6IFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbVwiLFxuICAgICAgICBmYXVsdENvdW50VGhyZXNob2xkOiAyNSxcbiAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKVxuICAgIH0pO1xuXG4gICAgbGV0IGxvZ0dyb3VwOiBJTG9nR3JvdXAgPSBuZXcgTG9nR3JvdXAoc3RhY2ssIFwiTG9nc1wiLCB7XG4gICAgfSk7XG5cbiAgICBsZXQgcmlkZU9wZXJhdGlvbjogT3BlcmF0aW9uID0ge1xuICAgICAgICBvcGVyYXRpb25OYW1lOiBcInJpZGVcIixcbiAgICAgICAgc2VydmljZTogc2VydmljZSxcbiAgICAgICAgcGF0aDogXCIvcmlkZVwiLFxuICAgICAgICBpc0NyaXRpY2FsOiB0cnVlLFxuICAgICAgICBodHRwTWV0aG9kczogWyBcIkdFVFwiIF0sXG4gICAgICAgIHNlcnZlclNpZGVDb250cmlidXRvckluc2lnaHRSdWxlRGV0YWlsczoge1xuICAgICAgICAgICAgbG9nR3JvdXBzOiBbIGxvZ0dyb3VwIF0sXG4gICAgICAgICAgICBzdWNjZXNzTGF0ZW5jeU1ldHJpY0pzb25QYXRoOiBcIiQuU3VjY2Vzc0xhdGVuY3lcIixcbiAgICAgICAgICAgIGZhdWx0TWV0cmljSnNvblBhdGg6IFwiJC5GYXVsdHNcIixcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWVKc29uUGF0aDogXCIkLk9wZXJhdGlvblwiLFxuICAgICAgICAgICAgaW5zdGFuY2VJZEpzb25QYXRoOiBcIiQuSW5zdGFuY2VJZFwiLFxuICAgICAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZUlkSnNvblBhdGg6IFwiJC5BWi1JRFwiXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBuZXcgT3BlcmF0aW9uTWV0cmljRGV0YWlscyh7XG4gICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBcInJpZGVcIixcbiAgICAgICAgICAgIG1ldHJpY05hbWVzcGFjZTogXCJmcm9udC1lbmQvbWV0cmljc1wiLFxuICAgICAgICAgICAgc3VjY2Vzc01ldHJpY05hbWVzOiBbIFwiU3VjY2Vzc1wiIF0sXG4gICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRcIiwgXCJFcnJvclwiIF0sXG4gICAgICAgICAgICBhbGFybVN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICBwZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NBbGFybVRocmVzaG9sZDogOTkuOSxcbiAgICAgICAgICAgIGZhdWx0QWxhcm1UaHJlc2hvbGQ6IDAuMSxcbiAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJTdW1cIiBdLFxuICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBbIFwiU3VtXCIgXSxcbiAgICAgICAgICAgIG1ldHJpY0RpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICB6b25hbERpbWVuc2lvbnMoYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFaLUlEXCI6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIHNlcnZlclNpZGVMYXRlbmN5TWV0cmljRGV0YWlsczogbmV3IE9wZXJhdGlvbk1ldHJpY0RldGFpbHMoe1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6IFwiZnJvbnQtZW5kL21ldHJpY3NcIixcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgIGZhdWx0TWV0cmljTmFtZXM6IFsgXCJGYXVsdExhdGVuY3lcIiBdLFxuICAgICAgICAgICAgYWxhcm1TdGF0aXN0aWM6IFwicDk5XCIsXG4gICAgICAgICAgICB1bml0OiBVbml0Lk1JTExJU0VDT05EUyxcbiAgICAgICAgICAgIHBlcmlvZDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogNSxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiAzLFxuICAgICAgICAgICAgc3VjY2Vzc0FsYXJtVGhyZXNob2xkOiAxMDAsXG4gICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiAxLFxuICAgICAgICAgICAgZ3JhcGhlZEZhdWx0U3RhdGlzdGljczogWyBcInA5OVwiIF0sXG4gICAgICAgICAgICBncmFwaGVkU3VjY2Vzc1N0YXRpc3RpY3M6IFsgXCJwNTBcIiwgXCJwOTlcIiwgXCJ0bTk5XCIgXSxcbiAgICAgICAgICAgIG1ldHJpY0RpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICB6b25hbERpbWVuc2lvbnMoYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFaLUlEXCI6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIGNhbmFyeVRlc3RQcm9wczoge1xuICAgICAgICAgIHJlcXVlc3RDb3VudDogMTAsXG4gICAgICAgICAgc2NoZWR1bGU6IFwicmF0ZSgxIG1pbnV0ZSlcIixcbiAgICAgICAgICBsb2FkQmFsYW5jZXI6IGxvYWRiYWxhbmNlclxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxldCBwYXlPcGVyYXRpb246IE9wZXJhdGlvbiA9IHtcbiAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJwYXlcIixcbiAgICAgICAgc2VydmljZTogc2VydmljZSxcbiAgICAgICAgcGF0aDogXCIvcGF5XCIsXG4gICAgICAgIGlzQ3JpdGljYWw6IHRydWUsXG4gICAgICAgIGh0dHBNZXRob2RzOiBbIFwiR0VUXCIgXSxcbiAgICAgICAgc2VydmVyU2lkZUNvbnRyaWJ1dG9ySW5zaWdodFJ1bGVEZXRhaWxzOiB7XG4gICAgICAgICAgICBsb2dHcm91cHM6IFsgbG9nR3JvdXAgXSxcbiAgICAgICAgICAgIHN1Y2Nlc3NMYXRlbmN5TWV0cmljSnNvblBhdGg6IFwiJC5TdWNjZXNzTGF0ZW5jeVwiLFxuICAgICAgICAgICAgZmF1bHRNZXRyaWNKc29uUGF0aDogXCIkLkZhdWx0c1wiLFxuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZUpzb25QYXRoOiBcIiQuT3BlcmF0aW9uXCIsXG4gICAgICAgICAgICBpbnN0YW5jZUlkSnNvblBhdGg6IFwiJC5JbnN0YW5jZUlkXCIsXG4gICAgICAgICAgICBhdmFpbGFiaWxpdHlab25lSWRKc29uUGF0aDogXCIkLkFaLUlEXCJcbiAgICAgICAgfSxcbiAgICAgICAgc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicGF5XCIsXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6IFwiZnJvbnQtZW5kL21ldHJpY3NcIixcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NcIiBdLFxuICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0XCIsIFwiRXJyb3JcIiBdLFxuICAgICAgICAgICAgYWxhcm1TdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiA1LFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IDk5LjksXG4gICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiAwLjEsXG4gICAgICAgICAgICBncmFwaGVkRmF1bHRTdGF0aXN0aWNzOiBbIFwiU3VtXCIgXSxcbiAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInBheVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJwYXlcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgICAgICBcbiAgICAgICAgfSksXG4gICAgICAgIHNlcnZlclNpZGVMYXRlbmN5TWV0cmljRGV0YWlsczogbmV3IE9wZXJhdGlvbk1ldHJpY0RldGFpbHMoe1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJwYXlcIixcbiAgICAgICAgICAgIG1ldHJpY05hbWVzcGFjZTogXCJmcm9udC1lbmQvbWV0cmljc1wiLFxuICAgICAgICAgICAgc3VjY2Vzc01ldHJpY05hbWVzOiBbIFwiU3VjY2Vzc0xhdGVuY3lcIiBdLFxuICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0TGF0ZW5jeVwiIF0sXG4gICAgICAgICAgICBhbGFybVN0YXRpc3RpYzogXCJwOTlcIixcbiAgICAgICAgICAgIHVuaXQ6IFVuaXQuTUlMTElTRUNPTkRTLFxuICAgICAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiA1LFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IDEwMCxcbiAgICAgICAgICAgIGZhdWx0QWxhcm1UaHJlc2hvbGQ6IDEsXG4gICAgICAgICAgICBncmFwaGVkRmF1bHRTdGF0aXN0aWNzOiBbIFwicDk5XCIgXSxcbiAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcInA1MFwiLCBcInA5OVwiLCBcInRtOTlcIiBdLFxuICAgICAgICAgICAgbWV0cmljRGltZW5zaW9uczoge1xuICAgICAgICAgICAgICAgIHpvbmFsRGltZW5zaW9ucyhhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQVotSURcIjogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJwYXlcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicGF5XCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pLFxuICAgICAgICBjYW5hcnlUZXN0UHJvcHM6IHtcbiAgICAgICAgICByZXF1ZXN0Q291bnQ6IDEwLFxuICAgICAgICAgIHNjaGVkdWxlOiBcInJhdGUoMSBtaW51dGUpXCIsXG4gICAgICAgICAgbG9hZEJhbGFuY2VyOiBsb2FkYmFsYW5jZXJcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzZXJ2aWNlLmFkZE9wZXJhdGlvbihyaWRlT3BlcmF0aW9uKTtcbiAgICBzZXJ2aWNlLmFkZE9wZXJhdGlvbihwYXlPcGVyYXRpb24pO1xuXG4gICAgbmV3IE11bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHkoc3RhY2ssIFwiTUFaT2JzZXJ2YWJpbGl0eVwiLCB7XG4gICAgICAgIGluc3RydW1lbnRlZFNlcnZpY2VPYnNlcnZhYmlsaXR5UHJvcHM6IHtcbiAgICAgICAgICAgIGNyZWF0ZURhc2hib2FyZHM6IHRydWUsXG4gICAgICAgICAgICBsb2FkQmFsYW5jZXI6IGxvYWRiYWxhbmNlcixcbiAgICAgICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiAwLjcsXG4gICAgICAgICAgICBpbnRlcnZhbDogRHVyYXRpb24ubWludXRlcygzMClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcbn0pOyJdfQ==