"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const assertions_1 = require("aws-cdk-lib/assertions");
const OutlierDetectionAlgorithm_1 = require("../src/utilities/OutlierDetectionAlgorithm");
const aws_elasticloadbalancingv2_1 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const MultiAvailabilityZoneObservability_1 = require("../src/MultiAvailabilityZoneObservability");
test('Basic service observability', () => {
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
    let natGateways = {};
    subnets.subnets.forEach((subnet, index) => {
        let az = subnet.availabilityZone;
        let subnetId = subnet.subnetId;
        natGateways[az] = [
            new aws_ec2_1.CfnNatGateway(stack, "AZ" + index + "NatGateway", {
                subnetId: subnetId
            })
        ];
    });
    new MultiAvailabilityZoneObservability_1.MultiAvailabilityZoneObservability(stack, "MAZObservability", {
        basicServiceObservabilityProps: {
            applicationLoadBalancers: [
                new aws_elasticloadbalancingv2_1.ApplicationLoadBalancer(stack, "alb", {
                    vpc: vpc,
                    crossZoneEnabled: false
                })
            ],
            natGateways: natGateways,
            outlierDetectionAlgorithm: OutlierDetectionAlgorithm_1.OutlierDetectionAlgorithm.STATIC,
            outlierThreshold: 0.7,
            faultCountPercentageThreshold: 1.0,
            packetLossImpactPercentageThreshold: 0.01,
            serviceName: "test",
            period: cdk.Duration.seconds(60),
            createDashboard: true
        }
    });
    assertions_1.Template.fromStack(stack);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaWMtc2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmFzaWMtc2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW1DO0FBQ25DLHVEQUFrRDtBQUNsRCwwRkFBdUY7QUFDdkYsdUZBQWlGO0FBQ2pGLGlEQUFzRjtBQUN0RixrR0FBK0Y7QUFFL0YsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRTlDLElBQUksR0FBRyxHQUFhO1FBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUc7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRztRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHO0tBQ2xDLENBQUE7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLGFBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO1FBQzVCLGlCQUFpQixFQUFFLEdBQUc7UUFDdEIsbUJBQW1CLEVBQUU7WUFDakI7Z0JBQ0ksVUFBVSxFQUFFLG9CQUFVLENBQUMsbUJBQW1CO2dCQUMxQyxJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxRQUFRLEVBQUUsRUFBRTthQUNmO1NBQ0o7UUFDRCxxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLFdBQVcsRUFBRSxDQUFDO0tBQ2pCLENBQUMsQ0FBQztJQUVKLElBQUksT0FBTyxHQUFvQixHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzVDLFVBQVUsRUFBRSxvQkFBVSxDQUFDLG1CQUFtQjtLQUM3QyxDQUFDLENBQUM7SUFFSCxJQUFJLFdBQVcsR0FBcUMsRUFBRSxDQUFDO0lBRXZELE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBRS9CLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRztZQUNkLElBQUksdUJBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLEtBQUssR0FBRyxZQUFZLEVBQUU7Z0JBQ2xELFFBQVEsRUFBRSxRQUFRO2FBQ3JCLENBQUM7U0FDTCxDQUFDO0lBQ04sQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLHVFQUFrQyxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRTtRQUM5RCw4QkFBOEIsRUFBRTtZQUM1Qix3QkFBd0IsRUFBRTtnQkFDdEIsSUFBSSxvREFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO29CQUN0QyxHQUFHLEVBQUUsR0FBRztvQkFDUixnQkFBZ0IsRUFBRSxLQUFLO2lCQUMxQixDQUFDO2FBQ0w7WUFDRCxXQUFXLEVBQUUsV0FBVztZQUN4Qix5QkFBeUIsRUFBRSxxREFBeUIsQ0FBQyxNQUFNO1lBQzNELGdCQUFnQixFQUFFLEdBQUc7WUFDckIsNkJBQTZCLEVBQUUsR0FBRztZQUNsQyxtQ0FBbUMsRUFBRSxJQUFJO1lBQ3pDLFdBQVcsRUFBRSxNQUFNO1lBQ25CLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDaEMsZUFBZSxFQUFFLElBQUk7U0FDeEI7S0FDSixDQUFDLENBQUM7SUFFSCxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnO1xuaW1wb3J0IHsgT3V0bGllckRldGVjdGlvbkFsZ29yaXRobSB9IGZyb20gJy4uL3NyYy91dGlsaXRpZXMvT3V0bGllckRldGVjdGlvbkFsZ29yaXRobSc7XG5pbXBvcnQgeyBBcHBsaWNhdGlvbkxvYWRCYWxhbmNlciB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCB7IENmbk5hdEdhdGV3YXksIFNlbGVjdGVkU3VibmV0cywgU3VibmV0VHlwZSwgVnBjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgeyBNdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5IH0gZnJvbSAnLi4vc3JjL011bHRpQXZhaWxhYmlsaXR5Wm9uZU9ic2VydmFiaWxpdHknO1xuXG50ZXN0KCdCYXNpYyBzZXJ2aWNlIG9ic2VydmFiaWxpdHknLCAoKSA9PiB7XG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBjZGsuU3RhY2soYXBwLCBcIlRlc3RTdGFja1wiKTtcblxuICAgIGxldCBhenM6IHN0cmluZ1tdID0gW1xuICAgICAgICBjZGsuRm4ucmVmKFwiQVdTOjpSZWdpb25cIikgKyBcImFcIixcbiAgICAgICAgY2RrLkZuLnJlZihcIkFXUzo6UmVnaW9uXCIpICsgXCJiXCIsXG4gICAgICAgIGNkay5Gbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSArIFwiY1wiLFxuICAgIF1cblxuICAgIGxldCB2cGMgPSBuZXcgVnBjKHN0YWNrLCBcInZwY1wiLCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBhenMsXG4gICAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdWJuZXRUeXBlOiBTdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJwcml2YXRlX3dpdGhfZWdyZXNzX3N1Ym5ldHNcIixcbiAgICAgICAgICAgICAgICBjaWRyTWFzazogMjRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlSW50ZXJuZXRHYXRld2F5OiBmYWxzZSxcbiAgICAgICAgbmF0R2F0ZXdheXM6IDBcbiAgICB9KTtcblxuICAgbGV0IHN1Ym5ldHM6IFNlbGVjdGVkU3VibmV0cyA9IHZwYy5zZWxlY3RTdWJuZXRzKHtcbiAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTXG4gICAgfSk7XG5cbiAgICBsZXQgbmF0R2F0ZXdheXM6IHtba2V5OiBzdHJpbmddOiBDZm5OYXRHYXRld2F5W119ID0ge307XG5cbiAgICBzdWJuZXRzLnN1Ym5ldHMuZm9yRWFjaCgoc3VibmV0LCBpbmRleCkgPT4ge1xuICAgICAgICBsZXQgYXogPSBzdWJuZXQuYXZhaWxhYmlsaXR5Wm9uZTtcbiAgICAgICAgbGV0IHN1Ym5ldElkID0gc3VibmV0LnN1Ym5ldElkO1xuXG4gICAgICAgIG5hdEdhdGV3YXlzW2F6XSA9IFsgXG4gICAgICAgICAgICBuZXcgQ2ZuTmF0R2F0ZXdheShzdGFjaywgXCJBWlwiICsgaW5kZXggKyBcIk5hdEdhdGV3YXlcIiwge1xuICAgICAgICAgICAgICAgIHN1Ym5ldElkOiBzdWJuZXRJZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgXTtcbiAgICB9KTtcblxuICAgIG5ldyBNdWx0aUF2YWlsYWJpbGl0eVpvbmVPYnNlcnZhYmlsaXR5KHN0YWNrLCBcIk1BWk9ic2VydmFiaWxpdHlcIiwge1xuICAgICAgICBiYXNpY1NlcnZpY2VPYnNlcnZhYmlsaXR5UHJvcHM6IHtcbiAgICAgICAgICAgIGFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyczogW1xuICAgICAgICAgICAgICAgIG5ldyBBcHBsaWNhdGlvbkxvYWRCYWxhbmNlcihzdGFjaywgXCJhbGJcIiwge1xuICAgICAgICAgICAgICAgICAgICB2cGM6IHZwYyxcbiAgICAgICAgICAgICAgICAgICAgY3Jvc3Nab25lRW5hYmxlZDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5hdEdhdGV3YXlzOiBuYXRHYXRld2F5cyxcbiAgICAgICAgICAgIG91dGxpZXJEZXRlY3Rpb25BbGdvcml0aG06IE91dGxpZXJEZXRlY3Rpb25BbGdvcml0aG0uU1RBVElDLFxuICAgICAgICAgICAgb3V0bGllclRocmVzaG9sZDogMC43LFxuICAgICAgICAgICAgZmF1bHRDb3VudFBlcmNlbnRhZ2VUaHJlc2hvbGQ6IDEuMCxcbiAgICAgICAgICAgIHBhY2tldExvc3NJbXBhY3RQZXJjZW50YWdlVGhyZXNob2xkOiAwLjAxLFxuICAgICAgICAgICAgc2VydmljZU5hbWU6IFwidGVzdFwiLFxuICAgICAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICBjcmVhdGVEYXNoYm9hcmQ6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcbn0pOyJdfQ==