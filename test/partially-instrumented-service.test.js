"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_elasticloadbalancingv2_1 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const MultiAvailabilityZoneObservability_1 = require("../src/MultiAvailabilityZoneObservability");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const Service_1 = require("../src/services/Service");
const Operation_1 = require("../src/services/Operation");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
test('Partially instrumented service', () => {
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
    let rideOperation = new Operation_1.Operation({
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: ["GET"],
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
            createDashboards: false,
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
test('Partially instrumented service adds canaries', () => {
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
    let rideOperation = new Operation_1.Operation({
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: ["GET"],
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
            createDashboards: false,
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
test('Partially instrumented service with canaries', () => {
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
        period: aws_cdk_lib_1.Duration.seconds(60)
    });
    let rideOperation = {
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: ["GET"],
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
        canaryMetricDetails: {
            canaryAvailabilityMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
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
            canaryLatencyMetricDetails: new MultiAvailabilityZoneObservability_1.OperationMetricDetails({
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
        }
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbGx5LWluc3RydW1lbnRlZC1zZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXJ0aWFsbHktaW5zdHJ1bWVudGVkLXNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUNuQyx1REFBa0Q7QUFDbEQsaURBQXVFO0FBQ3ZFLHVGQUFpRjtBQUNqRixrR0FBaUk7QUFDakksNkNBQXVDO0FBQ3ZDLHFEQUFrRDtBQUNsRCx5REFBc0Q7QUFDdEQsK0RBQWtEO0FBR2xELElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7SUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUU5QyxJQUFJLEdBQUcsR0FBYTtRQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUc7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRztLQUNsQyxDQUFBO0lBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxhQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtRQUM1QixpQkFBaUIsRUFBRSxHQUFHO1FBQ3RCLG1CQUFtQixFQUFFO1lBQ2pCO2dCQUNJLFVBQVUsRUFBRSxvQkFBVSxDQUFDLG1CQUFtQjtnQkFDMUMsSUFBSSxFQUFFLDZCQUE2QjtnQkFDbkMsUUFBUSxFQUFFLEVBQUU7YUFDZjtTQUNKO1FBQ0QscUJBQXFCLEVBQUUsS0FBSztRQUM1QixXQUFXLEVBQUUsQ0FBQztLQUNqQixDQUFDLENBQUM7SUFHSCxJQUFJLE9BQU8sR0FB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QUFDO0lBRXBDLElBQUksdUVBQWtDLENBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFO1FBQzlELHFDQUFxQyxFQUFFO1lBQ25DLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLElBQUksb0RBQXVCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtnQkFDcEQsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsZ0JBQWdCLEVBQUUsS0FBSztnQkFDdkIsVUFBVSxFQUFFLE9BQU87YUFDdEIsQ0FBQztZQUNGLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGdCQUFnQixFQUFFLEdBQUc7WUFDckIsUUFBUSxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztTQUNqQztLQUNKLENBQUMsQ0FBQztJQUVILHFCQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucyc7XG5pbXBvcnQgeyBTZWxlY3RlZFN1Ym5ldHMsIFN1Ym5ldFR5cGUsIFZwYyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2Mic7XG5pbXBvcnQgeyBJU2VydmljZSwgTXVsdGlBdmFpbGFiaWxpdHlab25lT2JzZXJ2YWJpbGl0eSwgT3BlcmF0aW9uTWV0cmljRGV0YWlscyB9IGZyb20gJy4uL3NyYy9NdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgU2VydmljZSB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy9TZXJ2aWNlJztcbmltcG9ydCB7IE9wZXJhdGlvbiB9IGZyb20gJy4uL3NyYy9zZXJ2aWNlcy9PcGVyYXRpb24nO1xuaW1wb3J0IHsgVW5pdCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoJztcbmltcG9ydCB7IElPcGVyYXRpb24gfSBmcm9tICcuLi9zcmMvc2VydmljZXMvSU9wZXJhdGlvbic7XG5cbnRlc3QoJ1BhcnRpYWxseSBpbnN0cnVtZW50ZWQgc2VydmljZScsICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IGNkay5TdGFjayhhcHAsIFwiVGVzdFN0YWNrXCIpO1xuXG4gICAgbGV0IGF6czogc3RyaW5nW10gPSBbXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiYVwiLFxuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImJcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJjXCIsXG4gICAgXVxuXG4gICAgbGV0IHZwYyA9IG5ldyBWcGMoc3RhY2ssIFwidnBjXCIsIHtcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZXM6IGF6cyxcbiAgICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgICAgICAgICBuYW1lOiBcInByaXZhdGVfd2l0aF9lZ3Jlc3Nfc3VibmV0c1wiLFxuICAgICAgICAgICAgICAgIGNpZHJNYXNrOiAyNFxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjcmVhdGVJbnRlcm5ldEdhdGV3YXk6IGZhbHNlLFxuICAgICAgICBuYXRHYXRld2F5czogMFxuICAgIH0pO1xuXG4gICAgXG4gICAgbGV0IHN1Ym5ldHM6IFNlbGVjdGVkU3VibmV0cyA9IHZwYy5zZWxlY3RTdWJuZXRzKHtcbiAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTXG4gICAgfSk7XG5cbiAgICBsZXQgc2VydmljZTogSVNlcnZpY2UgPSBuZXcgU2VydmljZSh7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBcInRlc3RcIixcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiB2cGMuYXZhaWxhYmlsaXR5Wm9uZXMsXG4gICAgICAgIGJhc2VVcmw6IFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbVwiLFxuICAgICAgICBmYXVsdENvdW50VGhyZXNob2xkOiAyNSxcbiAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICB9KTtcblxuICAgIGxldCByaWRlT3BlcmF0aW9uOiBJT3BlcmF0aW9uID0gbmV3IE9wZXJhdGlvbih7XG4gICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicmlkZVwiLFxuICAgICAgICBzZXJ2aWNlOiBzZXJ2aWNlLFxuICAgICAgICBwYXRoOiBcIi9yaWRlXCIsXG4gICAgICAgIGlzQ3JpdGljYWw6IHRydWUsXG4gICAgICAgIGh0dHBNZXRob2RzOiBbIFwiR0VUXCIgXSxcbiAgICAgICAgc2VydmVyU2lkZUF2YWlsYWJpbGl0eU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicmlkZVwiLFxuICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICBzdWNjZXNzTWV0cmljTmFtZXM6IFsgXCJTdWNjZXNzXCIgXSxcbiAgICAgICAgICAgIGZhdWx0TWV0cmljTmFtZXM6IFsgXCJGYXVsdFwiLCBcIkVycm9yXCIgXSxcbiAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgdW5pdDogVW5pdC5DT1VOVCxcbiAgICAgICAgICAgIHBlcmlvZDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogNSxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiAzLFxuICAgICAgICAgICAgc3VjY2Vzc0FsYXJtVGhyZXNob2xkOiA5OS45LFxuICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMC4xLFxuICAgICAgICAgICAgZ3JhcGhlZEZhdWx0U3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICBncmFwaGVkU3VjY2Vzc1N0YXRpc3RpY3M6IFsgXCJTdW1cIiBdLFxuICAgICAgICAgICAgbWV0cmljRGltZW5zaW9uczoge1xuICAgICAgICAgICAgICAgIHpvbmFsRGltZW5zaW9ucyhhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQVotSURcIjogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVnaW9uYWxEaW1lbnNpb25zKHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgICAgXG4gICAgICAgIH0pLFxuICAgICAgICBzZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicmlkZVwiLFxuICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICBzdWNjZXNzTWV0cmljTmFtZXM6IFsgXCJTdWNjZXNzTGF0ZW5jeVwiIF0sXG4gICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcInA5OVwiLFxuICAgICAgICAgICAgdW5pdDogVW5pdC5NSUxMSVNFQ09ORFMsXG4gICAgICAgICAgICBwZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NBbGFybVRocmVzaG9sZDogMTAwLFxuICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMSxcbiAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJwOTlcIiBdLFxuICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBbIFwicDUwXCIsIFwicDk5XCIsIFwidG05OVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBzZXJ2aWNlLmFkZE9wZXJhdGlvbihyaWRlT3BlcmF0aW9uKTtcblxuICAgIG5ldyBNdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5KHN0YWNrLCBcIk1BWk9ic2VydmFiaWxpdHlcIiwge1xuICAgICAgICBpbnN0cnVtZW50ZWRTZXJ2aWNlT2JzZXJ2YWJpbGl0eVByb3BzOiB7XG4gICAgICAgICAgICBjcmVhdGVEYXNoYm9hcmRzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRCYWxhbmNlcjogbmV3IEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHN0YWNrLCBcImFsYlwiLCB7XG4gICAgICAgICAgICAgICAgdnBjOiB2cGMsXG4gICAgICAgICAgICAgICAgY3Jvc3Nab25lRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdnBjU3VibmV0czogc3VibmV0c1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzZXJ2aWNlOiBzZXJ2aWNlLFxuICAgICAgICAgICAgb3V0bGllclRocmVzaG9sZDogMC43LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IER1cmF0aW9uLm1pbnV0ZXMoMzApXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIFRlbXBsYXRlLmZyb21TdGFjayhzdGFjayk7XG59KTtcblxudGVzdCgnUGFydGlhbGx5IGluc3RydW1lbnRlZCBzZXJ2aWNlIGFkZHMgY2FuYXJpZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBjZGsuU3RhY2soYXBwLCBcIlRlc3RTdGFja1wiKTtcblxuICAgIGxldCBhenM6IHN0cmluZ1tdID0gW1xuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImFcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJiXCIsXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiY1wiLFxuICAgIF1cblxuICAgIGxldCB2cGMgPSBuZXcgVnBjKHN0YWNrLCBcInZwY1wiLCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBhenMsXG4gICAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdWJuZXRUeXBlOiBTdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJwcml2YXRlX3dpdGhfZWdyZXNzX3N1Ym5ldHNcIixcbiAgICAgICAgICAgICAgICBjaWRyTWFzazogMjRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlSW50ZXJuZXRHYXRld2F5OiBmYWxzZSxcbiAgICAgICAgbmF0R2F0ZXdheXM6IDBcbiAgICB9KTtcblxuICAgIFxuICAgIGxldCBzdWJuZXRzOiBTZWxlY3RlZFN1Ym5ldHMgPSB2cGMuc2VsZWN0U3VibmV0cyh7XG4gICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTU1xuICAgIH0pO1xuXG4gICAgbGV0IHNlcnZpY2U6IElTZXJ2aWNlID0gbmV3IFNlcnZpY2Uoe1xuICAgICAgICBzZXJ2aWNlTmFtZTogXCJ0ZXN0XCIsXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVOYW1lczogdnBjLmF2YWlsYWJpbGl0eVpvbmVzLFxuICAgICAgICBiYXNlVXJsOiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb21cIixcbiAgICAgICAgZmF1bHRDb3VudFRocmVzaG9sZDogMjUsXG4gICAgICAgIHBlcmlvZDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgfSk7XG5cbiAgICBsZXQgcmlkZU9wZXJhdGlvbjogSU9wZXJhdGlvbiA9IG5ldyBPcGVyYXRpb24oe1xuICAgICAgICBvcGVyYXRpb25OYW1lOiBcInJpZGVcIixcbiAgICAgICAgc2VydmljZTogc2VydmljZSxcbiAgICAgICAgcGF0aDogXCIvcmlkZVwiLFxuICAgICAgICBpc0NyaXRpY2FsOiB0cnVlLFxuICAgICAgICBodHRwTWV0aG9kczogWyBcIkdFVFwiIF0sXG4gICAgICAgIHNlcnZlclNpZGVBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBuZXcgT3BlcmF0aW9uTWV0cmljRGV0YWlscyh7XG4gICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBcInJpZGVcIixcbiAgICAgICAgICAgIG1ldHJpY05hbWVzcGFjZTogXCJmcm9udC1lbmQvbWV0cmljc1wiLFxuICAgICAgICAgICAgc3VjY2Vzc01ldHJpY05hbWVzOiBbIFwiU3VjY2Vzc1wiIF0sXG4gICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRcIiwgXCJFcnJvclwiIF0sXG4gICAgICAgICAgICBhbGFybVN0YXRpc3RpYzogXCJTdW1cIixcbiAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICBwZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NBbGFybVRocmVzaG9sZDogOTkuOSxcbiAgICAgICAgICAgIGZhdWx0QWxhcm1UaHJlc2hvbGQ6IDAuMSxcbiAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJTdW1cIiBdLFxuICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBbIFwiU3VtXCIgXSxcbiAgICAgICAgICAgIG1ldHJpY0RpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICB6b25hbERpbWVuc2lvbnMoYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFaLUlEXCI6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gICAgICBcbiAgICAgICAgfSksXG4gICAgICAgIHNlcnZlclNpZGVMYXRlbmN5TWV0cmljRGV0YWlsczogbmV3IE9wZXJhdGlvbk1ldHJpY0RldGFpbHMoe1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6IFwiZnJvbnQtZW5kL21ldHJpY3NcIixcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgIGZhdWx0TWV0cmljTmFtZXM6IFsgXCJGYXVsdExhdGVuY3lcIiBdLFxuICAgICAgICAgICAgYWxhcm1TdGF0aXN0aWM6IFwicDk5XCIsXG4gICAgICAgICAgICB1bml0OiBVbml0Lk1JTExJU0VDT05EUyxcbiAgICAgICAgICAgIHBlcmlvZDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogNSxcbiAgICAgICAgICAgIGRhdGFwb2ludHNUb0FsYXJtOiAzLFxuICAgICAgICAgICAgc3VjY2Vzc0FsYXJtVGhyZXNob2xkOiAxMDAsXG4gICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiAxLFxuICAgICAgICAgICAgZ3JhcGhlZEZhdWx0U3RhdGlzdGljczogWyBcInA5OVwiIF0sXG4gICAgICAgICAgICBncmFwaGVkU3VjY2Vzc1N0YXRpc3RpY3M6IFsgXCJwNTBcIiwgXCJwOTlcIiwgXCJ0bTk5XCIgXSxcbiAgICAgICAgICAgIG1ldHJpY0RpbWVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICB6b25hbERpbWVuc2lvbnMoYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFaLUlEXCI6IGF2YWlsYWJpbGl0eVpvbmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KTtcblxuICAgIHNlcnZpY2UuYWRkT3BlcmF0aW9uKHJpZGVPcGVyYXRpb24pO1xuXG4gICAgbmV3IE11bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHkoc3RhY2ssIFwiTUFaT2JzZXJ2YWJpbGl0eVwiLCB7XG4gICAgICAgIGluc3RydW1lbnRlZFNlcnZpY2VPYnNlcnZhYmlsaXR5UHJvcHM6IHtcbiAgICAgICAgICAgIGNyZWF0ZURhc2hib2FyZHM6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZEJhbGFuY2VyOiBuZXcgQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIoc3RhY2ssIFwiYWxiXCIsIHtcbiAgICAgICAgICAgICAgICB2cGM6IHZwYyxcbiAgICAgICAgICAgICAgICBjcm9zc1pvbmVFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2cGNTdWJuZXRzOiBzdWJuZXRzXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgICAgICBvdXRsaWVyVGhyZXNob2xkOiAwLjcsXG4gICAgICAgICAgICBpbnRlcnZhbDogRHVyYXRpb24ubWludXRlcygzMClcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcbn0pO1xuXG50ZXN0KCdQYXJ0aWFsbHkgaW5zdHJ1bWVudGVkIHNlcnZpY2Ugd2l0aCBjYW5hcmllcycsICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IGNkay5TdGFjayhhcHAsIFwiVGVzdFN0YWNrXCIpO1xuXG4gICAgbGV0IGF6czogc3RyaW5nW10gPSBbXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiYVwiLFxuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImJcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJjXCIsXG4gICAgXVxuXG4gICAgbGV0IHZwYyA9IG5ldyBWcGMoc3RhY2ssIFwidnBjXCIsIHtcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZXM6IGF6cyxcbiAgICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgICAgICAgICBuYW1lOiBcInByaXZhdGVfd2l0aF9lZ3Jlc3Nfc3VibmV0c1wiLFxuICAgICAgICAgICAgICAgIGNpZHJNYXNrOiAyNFxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjcmVhdGVJbnRlcm5ldEdhdGV3YXk6IGZhbHNlLFxuICAgICAgICBuYXRHYXRld2F5czogMFxuICAgIH0pO1xuICAgXG4gICAgbGV0IHN1Ym5ldHM6IFNlbGVjdGVkU3VibmV0cyA9IHZwYy5zZWxlY3RTdWJuZXRzKHtcbiAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTXG4gICAgfSk7XG5cbiAgICBsZXQgc2VydmljZTogSVNlcnZpY2UgPSBuZXcgU2VydmljZSh7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBcInRlc3RcIixcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiB2cGMuYXZhaWxhYmlsaXR5Wm9uZXMsXG4gICAgICAgIGJhc2VVcmw6IFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbVwiLFxuICAgICAgICBmYXVsdENvdW50VGhyZXNob2xkOiAyNSxcbiAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKVxuICAgIH0pO1xuXG4gICAgbGV0IHJpZGVPcGVyYXRpb246IE9wZXJhdGlvbiA9IHtcbiAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgIHNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICAgIHBhdGg6IFwiL3JpZGVcIixcbiAgICAgICAgaXNDcml0aWNhbDogdHJ1ZSxcbiAgICAgICAgaHR0cE1ldGhvZHM6IFsgXCJHRVRcIiBdLFxuICAgICAgICBzZXJ2ZXJTaWRlQXZhaWxhYmlsaXR5TWV0cmljRGV0YWlsczogbmV3IE9wZXJhdGlvbk1ldHJpY0RldGFpbHMoe1xuICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6IFwiZnJvbnQtZW5kL21ldHJpY3NcIixcbiAgICAgICAgICAgIHN1Y2Nlc3NNZXRyaWNOYW1lczogWyBcIlN1Y2Nlc3NcIiBdLFxuICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0XCIsIFwiRXJyb3JcIiBdLFxuICAgICAgICAgICAgYWxhcm1TdGF0aXN0aWM6IFwiU3VtXCIsXG4gICAgICAgICAgICB1bml0OiBVbml0LkNPVU5ULFxuICAgICAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiA1LFxuICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IDk5LjksXG4gICAgICAgICAgICBmYXVsdEFsYXJtVGhyZXNob2xkOiAwLjEsXG4gICAgICAgICAgICBncmFwaGVkRmF1bHRTdGF0aXN0aWNzOiBbIFwiU3VtXCIgXSxcbiAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBzZXJ2ZXJTaWRlTGF0ZW5jeU1ldHJpY0RldGFpbHM6IG5ldyBPcGVyYXRpb25NZXRyaWNEZXRhaWxzKHtcbiAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwicmlkZVwiLFxuICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICBzdWNjZXNzTWV0cmljTmFtZXM6IFsgXCJTdWNjZXNzTGF0ZW5jeVwiIF0sXG4gICAgICAgICAgICBmYXVsdE1ldHJpY05hbWVzOiBbIFwiRmF1bHRMYXRlbmN5XCIgXSxcbiAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcInA5OVwiLFxuICAgICAgICAgICAgdW5pdDogVW5pdC5NSUxMSVNFQ09ORFMsXG4gICAgICAgICAgICBwZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NBbGFybVRocmVzaG9sZDogMTAwLFxuICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMSxcbiAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJwOTlcIiBdLFxuICAgICAgICAgICAgZ3JhcGhlZFN1Y2Nlc3NTdGF0aXN0aWNzOiBbIFwicDUwXCIsIFwicDk5XCIsIFwidG05OVwiIF0sXG4gICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgem9uYWxEaW1lbnNpb25zKGF2YWlsYWJpbGl0eVpvbmVJZDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBjYW5hcnlNZXRyaWNEZXRhaWxzOiB7XG4gICAgICAgICAgICBjYW5hcnlBdmFpbGFiaWxpdHlNZXRyaWNEZXRhaWxzOiBuZXcgT3BlcmF0aW9uTWV0cmljRGV0YWlscyh7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc01ldHJpY05hbWVzOiBbIFwiU3VjY2Vzc1wiIF0sXG4gICAgICAgICAgICAgICAgZmF1bHRNZXRyaWNOYW1lczogWyBcIkZhdWx0XCIsIFwiRXJyb3JcIiBdLFxuICAgICAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcIlN1bVwiLFxuICAgICAgICAgICAgICAgIHVuaXQ6IFVuaXQuQ09VTlQsXG4gICAgICAgICAgICAgICAgcGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogNSxcbiAgICAgICAgICAgICAgICBkYXRhcG9pbnRzVG9BbGFybTogMyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzQWxhcm1UaHJlc2hvbGQ6IDk5LjksXG4gICAgICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMC4xLFxuICAgICAgICAgICAgICAgIGdyYXBoZWRGYXVsdFN0YXRpc3RpY3M6IFsgXCJTdW1cIiBdLFxuICAgICAgICAgICAgICAgIGdyYXBoZWRTdWNjZXNzU3RhdGlzdGljczogWyBcIlN1bVwiIF0sXG4gICAgICAgICAgICAgICAgbWV0cmljRGltZW5zaW9uczoge1xuICAgICAgICAgICAgICAgICAgICB6b25hbERpbWVuc2lvbnMoYXZhaWxhYmlsaXR5Wm9uZUlkOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQVotSURcIjogYXZhaWxhYmlsaXR5Wm9uZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVnaW9uXCI6IHJlZ2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk9wZXJhdGlvblwiOiBcInJpZGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWdpb25hbERpbWVuc2lvbnMocmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNhbmFyeUxhdGVuY3lNZXRyaWNEZXRhaWxzOiBuZXcgT3BlcmF0aW9uTWV0cmljRGV0YWlscyh7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uTmFtZTogXCJyaWRlXCIsXG4gICAgICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiBcImZyb250LWVuZC9tZXRyaWNzXCIsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc01ldHJpY05hbWVzOiBbIFwiU3VjY2Vzc0xhdGVuY3lcIiBdLFxuICAgICAgICAgICAgICAgIGZhdWx0TWV0cmljTmFtZXM6IFsgXCJGYXVsdExhdGVuY3lcIiBdLFxuICAgICAgICAgICAgICAgIGFsYXJtU3RhdGlzdGljOiBcInA5OVwiLFxuICAgICAgICAgICAgICAgIHVuaXQ6IFVuaXQuTUlMTElTRUNPTkRTLFxuICAgICAgICAgICAgICAgIHBlcmlvZDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDUsXG4gICAgICAgICAgICAgICAgZGF0YXBvaW50c1RvQWxhcm06IDMsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc0FsYXJtVGhyZXNob2xkOiAxMDAsXG4gICAgICAgICAgICAgICAgZmF1bHRBbGFybVRocmVzaG9sZDogMSxcbiAgICAgICAgICAgICAgICBncmFwaGVkRmF1bHRTdGF0aXN0aWNzOiBbIFwicDk5XCIgXSxcbiAgICAgICAgICAgICAgICBncmFwaGVkU3VjY2Vzc1N0YXRpc3RpY3M6IFsgXCJwNTBcIiwgXCJwOTlcIiwgXCJ0bTk5XCIgXSxcbiAgICAgICAgICAgICAgICBtZXRyaWNEaW1lbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHpvbmFsRGltZW5zaW9ucyhhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBWi1JRFwiOiBhdmFpbGFiaWxpdHlab25lSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJSZWdpb25cIjogcmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiT3BlcmF0aW9uXCI6IFwicmlkZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbmFsRGltZW5zaW9ucyhyZWdpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlJlZ2lvblwiOiByZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJPcGVyYXRpb25cIjogXCJyaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gICBcbiAgICB9O1xuXG4gICAgc2VydmljZS5hZGRPcGVyYXRpb24ocmlkZU9wZXJhdGlvbik7XG5cbiAgICBuZXcgTXVsdGlBdmFpbGFiaWxpdHlab25lT2JzZXJ2YWJpbGl0eShzdGFjaywgXCJNQVpPYnNlcnZhYmlsaXR5XCIsIHtcbiAgICAgICAgaW5zdHJ1bWVudGVkU2VydmljZU9ic2VydmFiaWxpdHlQcm9wczoge1xuICAgICAgICAgICAgY3JlYXRlRGFzaGJvYXJkczogdHJ1ZSxcbiAgICAgICAgICAgIGxvYWRCYWxhbmNlcjogbmV3IEFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHN0YWNrLCBcImFsYlwiLCB7XG4gICAgICAgICAgICAgICAgdnBjOiB2cGMsXG4gICAgICAgICAgICAgICAgY3Jvc3Nab25lRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdnBjU3VibmV0czogc3VibmV0c1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzZXJ2aWNlOiBzZXJ2aWNlLFxuICAgICAgICAgICAgb3V0bGllclRocmVzaG9sZDogMC43LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IER1cmF0aW9uLm1pbnV0ZXMoMzApXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIFRlbXBsYXRlLmZyb21TdGFjayhzdGFjayk7XG59KTsiXX0=