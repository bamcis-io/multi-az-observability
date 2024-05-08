import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { MultiAvailabilityZoneObservability } from '../src/MultiAvailabilityZoneObservability';
import { Duration } from 'aws-cdk-lib';
import { IService } from '../src/services/IService';
import { IOperation } from '../src/services/IOperation';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityZoneMapper } from '../src/utilities/AvailabilityZoneMapper';

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

    let service: IService = {
        serviceName: "test",
        operations: [

        ],
        availabilityZoneIds: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: Duration.seconds(60),
        addOperation(operation: IOperation) {
            operation.service = this;
            this.operations.push(operation)
            return this;
        }
    };

    let rideOperation: IOperation = {
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: [ "GET" ],
        serverSideAvailabilityMetricDetails: {
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
            regionalDimensions(region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName
                }
            },
            zonalDimensions(availabilityZoneId: string, region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName,
                    "AZ-ID": availabilityZoneId
                }
            }
        },
        serverSideLatencyMetricDetails: {
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
            regionalDimensions(region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName
                }
            },
            zonalDimensions(availabilityZoneId: string, region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName,
                    "AZ-ID": availabilityZoneId
                }
            }
        }
    };

    service.addOperation(rideOperation);

    new MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboard: true,
            loadBalancer: new ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            availabilityZoneMapper: new AvailabilityZoneMapper(stack, "AZMapper"),
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

    let service: IService = {
        serviceName: "test",
        operations: [

        ],
        availabilityZoneIds: vpc.availabilityZones,
        baseUrl: "http://www.example.com",
        faultCountThreshold: 25,
        period: Duration.seconds(60),
        addOperation(operation: IOperation) {
            operation.service = this;
            this.operations.push(operation)
            return this;
        }
    };

    let rideOperation: IOperation = {
        operationName: "ride",
        service: service,
        path: "/ride",
        isCritical: true,
        httpMethods: [ "GET" ],
        serverSideAvailabilityMetricDetails: {
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
            regionalDimensions(region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName
                }
            },
            zonalDimensions(availabilityZoneId: string, region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName,
                    "AZ-ID": availabilityZoneId
                }
            }
        },
        serverSideLatencyMetricDetails: {
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
            regionalDimensions(region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName
                }
            },
            zonalDimensions(availabilityZoneId: string, region: string) {
                return {
                    "Region": region,
                    "Operation": this.operationName,
                    "AZ-ID": availabilityZoneId
                }
            }
        },
        canaryMetricDetails: {
            canaryAvailabilityMetricDetails: {
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
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": this.operationName
                    }
                },
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "Region": region,
                        "Operation": this.operationName,
                        "AZ-ID": availabilityZoneId
                    }
                }
            },
            canaryLatencyMetricDetails: {
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
                regionalDimensions(region: string) {
                    return {
                        "Region": region,
                        "Operation": this.operationName
                    }
                },
                zonalDimensions(availabilityZoneId: string, region: string) {
                    return {
                        "Region": region,
                        "Operation": this.operationName,
                        "AZ-ID": availabilityZoneId
                    }
                }
            }
        }   
    };

    service.addOperation(rideOperation);

    new MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        instrumentedServiceObservabilityProps: {
            createDashboard: true,
            loadBalancer: new ApplicationLoadBalancer(stack, "alb", {
                vpc: vpc,
                crossZoneEnabled: false,
                vpcSubnets: subnets
            }),
            service: service,
            outlierThreshold: 0.7,
            availabilityZoneMapper: new AvailabilityZoneMapper(stack, "AZMapper"),
            interval: Duration.minutes(30)
        }
    });

    Template.fromStack(stack);
});