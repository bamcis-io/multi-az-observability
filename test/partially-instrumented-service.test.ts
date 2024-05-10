import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IService, MultiAvailabilityZoneObservability, OperationMetricDetails } from '../src/MultiAvailabilityZoneObservability';
import { Duration } from 'aws-cdk-lib';
import { Service } from '../src/services/Service';
import { Operation } from '../src/services/Operation';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { IOperation } from '../src/services/IOperation';

test('Partially instrumented service', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    let azs: string[] = [
        cdk.Fn.ref("AWS::Region") + "a",
        cdk.Fn.ref("AWS::Region") + "b",
        cdk.Fn.ref("AWS::Region") + "c",
    ]

    let vpc = new Vpc(stack, "vpc", {
        availabilityZones: azs,
        subnetConfiguration: [
            {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                name: "private_with_egress_subnets",
                cidrMask: 24
            }
        ],
        createInternetGateway: false,
        natGateways: 0
    });

    
    let subnets: SelectedSubnets = vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
    });

    let service: IService = new Service({
        serviceName: "test",
        availabilityZoneNames: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: Duration.seconds(60),
    });

    let rideOperation: IOperation = new Operation({
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: [ "GET" ],
        serverSideAvailabilityMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "Success" ],
            faultMetricNames: [ "Fault", "Error" ],
            alarmStatistic: "Sum",
            unit: Unit.COUNT,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: [ "Sum" ],
            graphedSuccessStatistics: [ "Sum" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }     
        }),
        serverSideLatencyMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "SuccessLatency" ],
            faultMetricNames: [ "FaultLatency" ],
            alarmStatistic: "p99",
            unit: Unit.MILLISECONDS,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: [ "p99" ],
            graphedSuccessStatistics: [ "p50", "p99", "tm99" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }
        })
    });

    service.addOperation(rideOperation);

    new MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboards: false,
            loadBalancer: new ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            interval: Duration.minutes(30)
        }
    });

    Template.fromStack(stack);
});

test('Partially instrumented service adds canaries', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    let azs: string[] = [
        cdk.Fn.ref("AWS::Region") + "a",
        cdk.Fn.ref("AWS::Region") + "b",
        cdk.Fn.ref("AWS::Region") + "c",
    ]

    let vpc = new Vpc(stack, "vpc", {
        availabilityZones: azs,
        subnetConfiguration: [
            {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                name: "private_with_egress_subnets",
                cidrMask: 24
            }
        ],
        createInternetGateway: false,
        natGateways: 0
    });

    
    let subnets: SelectedSubnets = vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
    });

    let service: IService = new Service({
        serviceName: "test",
        availabilityZoneNames: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: Duration.seconds(60),
    });

    let rideOperation: IOperation = new Operation({
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: [ "GET" ],
        serverSideAvailabilityMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "Success" ],
            faultMetricNames: [ "Fault", "Error" ],
            alarmStatistic: "Sum",
            unit: Unit.COUNT,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: [ "Sum" ],
            graphedSuccessStatistics: [ "Sum" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }      
        }),
        serverSideLatencyMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "SuccessLatency" ],
            faultMetricNames: [ "FaultLatency" ],
            alarmStatistic: "p99",
            unit: Unit.MILLISECONDS,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: [ "p99" ],
            graphedSuccessStatistics: [ "p50", "p99", "tm99" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }
        })
    });

    service.addOperation(rideOperation);

    new MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboards: false,
            loadBalancer: new ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            interval: Duration.minutes(30)
        }
    });

    Template.fromStack(stack);
});

test('Partially instrumented service with canaries', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    let azs: string[] = [
        cdk.Fn.ref("AWS::Region") + "a",
        cdk.Fn.ref("AWS::Region") + "b",
        cdk.Fn.ref("AWS::Region") + "c",
    ]

    let vpc = new Vpc(stack, "vpc", {
        availabilityZones: azs,
        subnetConfiguration: [
            {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                name: "private_with_egress_subnets",
                cidrMask: 24
            }
        ],
        createInternetGateway: false,
        natGateways: 0
    });
   
    let subnets: SelectedSubnets = vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
    });

    let service: IService = new Service({
        serviceName: "test",
        availabilityZoneNames: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: Duration.seconds(60)
    });

    let rideOperation: Operation = {
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: [ "GET" ],
        serverSideAvailabilityMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "Success" ],
            faultMetricNames: [ "Fault", "Error" ],
            alarmStatistic: "Sum",
            unit: Unit.COUNT,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 99.9,
            faultAlarmThreshold: 0.1,
            graphedFaultStatistics: [ "Sum" ],
            graphedSuccessStatistics: [ "Sum" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }
        }),
        serverSideLatencyMetricDetails: new OperationMetricDetails({
            operationName: "ride",
            metricNamespace: "front-end/metrics",
            successMetricNames: [ "SuccessLatency" ],
            faultMetricNames: [ "FaultLatency" ],
            alarmStatistic: "p99",
            unit: Unit.MILLISECONDS,
            period: Duration.seconds(60),
            evaluationPeriods: 5,
            datapointsToAlarm: 3,
            successAlarmThreshold: 100,
            faultAlarmThreshold: 1,
            graphedFaultStatistics: [ "p99" ],
            graphedSuccessStatistics: [ "p50", "p99", "tm99" ],
            metricDimensions: {
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "AZ-ID": availabilityZoneId,
                        "Region": region,
                        "Operation": "ride"
                    }
                },
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": "ride"
                    }
                }
            }
        }),
        canaryMetricDetails: {
            canaryAvailabilityMetricDetails: new OperationMetricDetails({
                operationName: "ride",
                metricNamespace: "front-end/metrics",
                successMetricNames: [ "Success" ],
                faultMetricNames: [ "Fault", "Error" ],
                alarmStatistic: "Sum",
                unit: Unit.COUNT,
                period: Duration.seconds(60),
                evaluationPeriods: 5,
                datapointsToAlarm: 3,
                successAlarmThreshold: 99.9,
                faultAlarmThreshold: 0.1,
                graphedFaultStatistics: [ "Sum" ],
                graphedSuccessStatistics: [ "Sum" ],
                metricDimensions: {
                    zonalDimensions(availabilityZoneId: string, region: string) {
                        return {
                            "AZ-ID": availabilityZoneId,
                            "Region": region,
                            "Operation": "ride"
                        }
                    },
                    regionalDimensions(region: string) {
                        return {
                            "Region": region,
                            "Operation": "ride"
                        }
                    }
                }
            }),
            canaryLatencyMetricDetails: new OperationMetricDetails({
                operationName: "ride",
                metricNamespace: "front-end/metrics",
                successMetricNames: [ "SuccessLatency" ],
                faultMetricNames: [ "FaultLatency" ],
                alarmStatistic: "p99",
                unit: Unit.MILLISECONDS,
                period: Duration.seconds(60),
                evaluationPeriods: 5,
                datapointsToAlarm: 3,
                successAlarmThreshold: 100,
                faultAlarmThreshold: 1,
                graphedFaultStatistics: [ "p99" ],
                graphedSuccessStatistics: [ "p50", "p99", "tm99" ],
                metricDimensions: {
                    zonalDimensions(availabilityZoneId: string, region: string) {
                        return {
                            "AZ-ID": availabilityZoneId,
                            "Region": region,
                            "Operation": "ride"
                        }
                    },
                    regionalDimensions(region: string) {
                        return {
                            "Region": region,
                            "Operation": "ride"
                        }
                    }
                }
            })
        }   
    };

    service.addOperation(rideOperation);

    new MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboards: true,
            loadBalancer: new ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            interval: Duration.minutes(30)
        }
    });

    Template.fromStack(stack);
});