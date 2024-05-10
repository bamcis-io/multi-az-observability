"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanaryFunction = void 0;
const constructs_1 = require("constructs");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
class CanaryFunction extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        let xrayManagedPolicy = new aws_iam_1.ManagedPolicy(this, "xrayManagedPolicy", {
            path: "/canary/",
            statements: [
                new aws_iam_1.PolicyStatement({
                    actions: [
                        "xray:PutTraceSegments",
                        "xray:PutTelemetryRecords",
                        "xray:GetSamplingRules",
                        "xray:GetSamplingTargets",
                        "xray:GetSamplingStatisticSummaries"
                    ],
                    effect: aws_iam_1.Effect.ALLOW,
                    resources: ["*"]
                })
            ]
        });
        let ec2ManagedPolicy = new aws_iam_1.ManagedPolicy(this, "ec2ManagedPolicy", {
            path: "/canary/",
            statements: [
                new aws_iam_1.PolicyStatement({
                    actions: [
                        "ec2:CreateNetworkInterface",
                        "ec2:DescribeNetworkInterfaces",
                        "ec2:DeleteNetworkInterface"
                    ],
                    effect: aws_iam_1.Effect.ALLOW,
                    resources: ["*"]
                })
            ]
        });
        let executionRole = new aws_iam_1.Role(this, "executionRole", {
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
            path: "/canary/",
            managedPolicies: [
                xrayManagedPolicy,
                ec2ManagedPolicy
            ]
        });
        const dir = path.resolve(__dirname, './src');
        let code = aws_lambda_1.Code.fromAsset(dir, {
            bundling: {
                //image: new Runtime('python3.12:latest-arm64', RuntimeFamily.PYTHON).bundlingImage,
                image: aws_lambda_1.Runtime.PYTHON_3_12.bundlingImage,
                command: [
                    "bash", "-c",
                    "pip install --no-cache -r requirements.txt -t /asset-output && cp --archive --update . /asset-output"
                ],
                platform: "linux/arm64"
            }
        });
        if (props.vpc !== undefined && props.vpc != null) {
            let sg = new aws_ec2_1.SecurityGroup(this, "canarySecurityGroup", {
                description: "Allow canary to communicate with load balancer",
                vpc: props.vpc
            });
            this.function = new aws_lambda_1.Function(this, "canary", {
                runtime: aws_lambda_1.Runtime.PYTHON_3_12,
                code: code,
                handler: "index.handler",
                role: executionRole,
                architecture: aws_lambda_1.Architecture.ARM_64,
                tracing: aws_lambda_1.Tracing.ACTIVE,
                timeout: aws_cdk_lib_1.Duration.seconds(240),
                memorySize: 512,
                environment: {
                    "REGION": aws_cdk_lib_1.Fn.ref("AWS::Region"),
                    "PARTITION": aws_cdk_lib_1.Fn.ref("AWS::Partition"),
                    "TIMEOUT": props.httpTimeout !== undefined ? props.httpTimeout.toSeconds().toString() : "2",
                    "IGNORE_SSL_ERRORS": (props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true).toString().toLowerCase()
                },
                vpc: props.vpc,
                securityGroups: [sg],
                vpcSubnets: props.subnetSelect
            });
        }
        else {
            this.function = new aws_lambda_1.Function(this, "canary", {
                runtime: aws_lambda_1.Runtime.PYTHON_3_12,
                code: code,
                handler: "index.handler",
                role: executionRole,
                architecture: aws_lambda_1.Architecture.ARM_64,
                tracing: aws_lambda_1.Tracing.ACTIVE,
                timeout: aws_cdk_lib_1.Duration.seconds(240),
                memorySize: 512,
                environment: {
                    "REGION": aws_cdk_lib_1.Fn.ref("AWS::Region"),
                    "PARTITION": aws_cdk_lib_1.Fn.ref("AWS::Partition"),
                    "TIMEOUT": props.httpTimeout !== undefined ? props.httpTimeout.toSeconds().toString() : "2",
                    "IGNORE_SSL_ERRORS": (props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true).toString().toLowerCase()
                }
            });
        }
        this.function.addPermission("invokePermission", {
            action: "lambda:InvokeFunction",
            principal: new aws_iam_1.ServicePrincipal("events.amazonaws.com"),
            sourceArn: aws_cdk_lib_1.Fn.sub("arn:${AWS::Partition}:events:${AWS::Region}:${AWS::AccountId}:rule/*")
        });
        this.logGroup = new aws_logs_1.LogGroup(this, "logGroup", {
            logGroupName: `/aws/lambda/${this.function.functionName}`,
            retention: aws_logs_1.RetentionDays.ONE_WEEK,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY
        });
        new aws_iam_1.ManagedPolicy(this, "cwManagedPolicy", {
            path: "/canary/",
            statements: [
                new aws_iam_1.PolicyStatement({
                    actions: [
                        "cloudwatch:PutMetricData"
                    ],
                    effect: aws_iam_1.Effect.ALLOW,
                    resources: ["*"]
                }),
                new aws_iam_1.PolicyStatement({
                    actions: [
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    effect: aws_iam_1.Effect.ALLOW,
                    resources: [
                        this.logGroup.logGroupArn
                    ]
                })
            ],
            roles: [executionRole]
        });
    }
}
exports.CanaryFunction = CanaryFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuYXJ5RnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDYW5hcnlGdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFFdkMsaURBQTRIO0FBQzVILGlEQUFvRTtBQUNwRSx1REFBOEc7QUFDOUcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLDZDQUEwRDtBQUMxRCxtREFBMEU7QUFHMUUsTUFBYSxjQUFlLFNBQVEsc0JBQVM7SUFXekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEwQjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksaUJBQWlCLEdBQW1CLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDakYsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLElBQUkseUJBQWUsQ0FBQztvQkFDaEIsT0FBTyxFQUFFO3dCQUNMLHVCQUF1Qjt3QkFDdkIsMEJBQTBCO3dCQUMxQix1QkFBdUI7d0JBQ3ZCLHlCQUF5Qjt3QkFDekIsb0NBQW9DO3FCQUN2QztvQkFDRCxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO29CQUNwQixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7aUJBQ25CLENBQUM7YUFDTDtTQUNKLENBQUMsQ0FBQztRQUNILElBQUksZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMvRCxJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUU7Z0JBQ1IsSUFBSSx5QkFBZSxDQUFDO29CQUNoQixPQUFPLEVBQUU7d0JBQ0wsNEJBQTRCO3dCQUM1QiwrQkFBK0I7d0JBQy9CLDRCQUE0QjtxQkFDL0I7b0JBQ0QsTUFBTSxFQUFFLGdCQUFNLENBQUMsS0FBSztvQkFDcEIsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFD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QUFNLENBQUMsS0FBSztvQkFDcEIsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUNuQixDQUFDO2dCQUNGLElBQUkseUJBQWUsQ0FBQztvQkFDaEIsT0FBTyxFQUFFO3dCQUNMLHNCQUFzQjt3QkFDdEIsbUJBQW1CO3FCQUN0QjtvQkFDRCxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO29CQUNwQixTQUFTLEVBQUU7d0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXO3FCQUM1QjtpQkFDSixDQUFDO2FBQ0w7WUFDRCxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQUM7U0FDekIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdEpELHdDQXNKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDYW5hcnlGdW5jdGlvblByb3BzIH0gZnJvbSBcIi4vcHJvcHMvQ2FuYXJ5RnVuY3Rpb25Qcm9wc1wiO1xuaW1wb3J0IHsgRWZmZWN0LCBJTWFuYWdlZFBvbGljeSwgSVJvbGUsIE1hbmFnZWRQb2xpY3ksIFBvbGljeVN0YXRlbWVudCwgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBJU2VjdXJpdHlHcm91cCwgU2VjdXJpdHlHcm91cCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgeyBBcmNoaXRlY3R1cmUsIEFzc2V0Q29kZSwgQ29kZSwgRnVuY3Rpb24sIElGdW5jdGlvbiwgUnVudGltZSwgVHJhY2luZyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5pbXBvcnQgeyBEdXJhdGlvbiwgRm4sIFJlbW92YWxQb2xpY3kgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IElMb2dHcm91cCwgTG9nR3JvdXAsIFJldGVudGlvbkRheXMgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxvZ3NcIjtcbmltcG9ydCB7IElDYW5hcnlGdW5jdGlvbiB9IGZyb20gXCIuL0lDYW5hcnlGdW5jdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5RnVuY3Rpb24gZXh0ZW5kcyBDb25zdHJ1Y3QgaW1wbGVtZW50cyBJQ2FuYXJ5RnVuY3Rpb24ge1xuICAgIC8qKlxuICAgICAqIFRoZSBjYW5hcnkgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbjogSUZ1bmN0aW9uO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGxvZyBncm91cCB3aGVyZSB0aGUgY2FuYXJ0eSBsb2dzIHdpbGwgYmUgc2VudFxuICAgICAqL1xuICAgIGxvZ0dyb3VwOiBJTG9nR3JvdXA7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQ2FuYXJ5RnVuY3Rpb25Qcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIGxldCB4cmF5TWFuYWdlZFBvbGljeTogSU1hbmFnZWRQb2xpY3kgPSBuZXcgTWFuYWdlZFBvbGljeSh0aGlzLCBcInhyYXlNYW5hZ2VkUG9saWN5XCIsIHtcbiAgICAgICAgICAgIHBhdGg6IFwiL2NhbmFyeS9cIixcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OlB1dFRyYWNlU2VnbWVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieHJheTpQdXRUZWxlbWV0cnlSZWNvcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInhyYXk6R2V0U2FtcGxpbmdSdWxlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OkdldFNhbXBsaW5nVGFyZ2V0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OkdldFNhbXBsaW5nU3RhdGlzdGljU3VtbWFyaWVzXCJcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgZWMyTWFuYWdlZFBvbGljeSA9IG5ldyBNYW5hZ2VkUG9saWN5KHRoaXMsIFwiZWMyTWFuYWdlZFBvbGljeVwiLCB7XG4gICAgICAgICAgICBwYXRoOiBcIi9jYW5hcnkvXCIsXG4gICAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZU5ldHdvcmtJbnRlcmZhY2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlTmV0d29ya0ludGVyZmFjZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlbGV0ZU5ldHdvcmtJbnRlcmZhY2VcIlxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGV4ZWN1dGlvblJvbGU6IElSb2xlID0gbmV3IFJvbGUodGhpcywgXCJleGVjdXRpb25Sb2xlXCIsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoXCJsYW1iZGEuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgICAgICAgIHBhdGg6IFwiL2NhbmFyeS9cIixcbiAgICAgICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgICAgICAgIHhyYXlNYW5hZ2VkUG9saWN5LFxuICAgICAgICAgICAgICAgIGVjMk1hbmFnZWRQb2xpY3lcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGlyOiBzdHJpbmcgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKTtcbiAgICAgICAgbGV0IGNvZGU6IEFzc2V0Q29kZSA9IENvZGUuZnJvbUFzc2V0KGRpciwge1xuICAgICAgICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgICAgICAgICAvL2ltYWdlOiBuZXcgUnVudGltZSgncHl0aG9uMy4xMjpsYXRlc3QtYXJtNjQnLCBSdW50aW1lRmFtaWx5LlBZVEhPTikuYnVuZGxpbmdJbWFnZSxcbiAgICAgICAgICAgICAgICBpbWFnZTogUnVudGltZS5QWVRIT05fM18xMi5idW5kbGluZ0ltYWdlLFxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJiYXNoXCIsIFwiLWNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwaXAgaW5zdGFsbCAtLW5vLWNhY2hlIC1yIHJlcXVpcmVtZW50cy50eHQgLXQgL2Fzc2V0LW91dHB1dCAmJiBjcCAtLWFyY2hpdmUgLS11cGRhdGUgLiAvYXNzZXQtb3V0cHV0XCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHBsYXRmb3JtOiBcImxpbnV4L2FybTY0XCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgICAgICBpZiAocHJvcHMudnBjICE9PSB1bmRlZmluZWQgJiYgcHJvcHMudnBjICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBzZzogSVNlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCBcImNhbmFyeVNlY3VyaXR5R3JvdXBcIiwge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkFsbG93IGNhbmFyeSB0byBjb21tdW5pY2F0ZSB3aXRoIGxvYWQgYmFsYW5jZXJcIixcbiAgICAgICAgICAgICAgICB2cGM6IHByb3BzLnZwY1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJjYW5hcnlcIiwge1xuICAgICAgICAgICAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICByb2xlOiBleGVjdXRpb25Sb2xlLFxuICAgICAgICAgICAgICAgIGFyY2hpdGVjdHVyZTogQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgICAgICAgICB0cmFjaW5nOiBUcmFjaW5nLkFDVElWRSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDI0MCksXG4gICAgICAgICAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIFwiUkVHSU9OXCI6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgICAgICAgICBcIlBBUlRJVElPTlwiOiBGbi5yZWYoXCJBV1M6OlBhcnRpdGlvblwiKSxcbiAgICAgICAgICAgICAgICAgICAgXCJUSU1FT1VUXCI6IHByb3BzLmh0dHBUaW1lb3V0ICE9PSB1bmRlZmluZWQgPyBwcm9wcy5odHRwVGltZW91dC50b1NlY29uZHMoKS50b1N0cmluZygpIDogXCIyXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSUdOT1JFX1NTTF9FUlJPUlNcIjogKHByb3BzLmlnbm9yZVRsc0Vycm9ycyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmlnbm9yZVRsc0Vycm9ycyA9PSB0cnVlKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZwYzogcHJvcHMudnBjLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbc2ddLFxuICAgICAgICAgICAgICAgIHZwY1N1Ym5ldHM6IHByb3BzLnN1Ym5ldFNlbGVjdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJjYW5hcnlcIiwge1xuICAgICAgICAgICAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICByb2xlOiBleGVjdXRpb25Sb2xlLFxuICAgICAgICAgICAgICAgIGFyY2hpdGVjdHVyZTogQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgICAgICAgICB0cmFjaW5nOiBUcmFjaW5nLkFDVElWRSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDI0MCksXG4gICAgICAgICAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIFwiUkVHSU9OXCI6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgICAgICAgICBcIlBBUlRJVElPTlwiOiBGbi5yZWYoXCJBV1M6OlBhcnRpdGlvblwiKSxcbiAgICAgICAgICAgICAgICAgICAgXCJUSU1FT1VUXCI6IHByb3BzLmh0dHBUaW1lb3V0ICE9PSB1bmRlZmluZWQgPyBwcm9wcy5odHRwVGltZW91dC50b1NlY29uZHMoKS50b1N0cmluZygpIDogXCIyXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSUdOT1JFX1NTTF9FUlJPUlNcIjogKHByb3BzLmlnbm9yZVRsc0Vycm9ycyAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmlnbm9yZVRsc0Vycm9ycyA9PSB0cnVlKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZnVuY3Rpb24uYWRkUGVybWlzc2lvbihcImludm9rZVBlcm1pc3Npb25cIiwge1xuICAgICAgICAgICAgYWN0aW9uOiBcImxhbWJkYTpJbnZva2VGdW5jdGlvblwiLFxuICAgICAgICAgICAgcHJpbmNpcGFsOiBuZXcgU2VydmljZVByaW5jaXBhbChcImV2ZW50cy5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgICAgICAgc291cmNlQXJuOiBGbi5zdWIoXCJhcm46JHtBV1M6OlBhcnRpdGlvbn06ZXZlbnRzOiR7QVdTOjpSZWdpb259OiR7QVdTOjpBY2NvdW50SWR9OnJ1bGUvKlwiKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvZ0dyb3VwID0gbmV3IExvZ0dyb3VwKHRoaXMsIFwibG9nR3JvdXBcIiwge1xuICAgICAgICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9sYW1iZGEvJHt0aGlzLmZ1bmN0aW9uLmZ1bmN0aW9uTmFtZX1gLFxuICAgICAgICAgICAgcmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBNYW5hZ2VkUG9saWN5KHRoaXMsIFwiY3dNYW5hZ2VkUG9saWN5XCIsIHtcbiAgICAgICAgICAgIHBhdGg6IFwiL2NhbmFyeS9cIixcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbG91ZHdhdGNoOlB1dE1ldHJpY0RhdGFcIlxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nczpDcmVhdGVMb2dTdHJlYW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nczpQdXRMb2dFdmVudHNcIlxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0dyb3VwLmxvZ0dyb3VwQXJuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJvbGVzOiBbZXhlY3V0aW9uUm9sZV1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19