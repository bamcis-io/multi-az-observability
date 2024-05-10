"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityZoneMapper = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const constructs_1 = require("constructs");
const fs = require('fs');
const path = require("path");
/**
 * A construct that allows you to map AZ names to ids and back
 */
class AvailabilityZoneMapper extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        let xrayManagedPolicy = new aws_iam_1.ManagedPolicy(this, "XrayManagedPolicy", {
            path: "/azmapper/",
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
        let ec2ManagedPolicy = new aws_iam_1.ManagedPolicy(this, "EC2ManagedPolicy", {
            path: "/azmapper/",
            statements: [
                new aws_iam_1.PolicyStatement({
                    actions: [
                        "ec2:DescribeAvailabilityZones"
                    ],
                    effect: aws_iam_1.Effect.ALLOW,
                    resources: ["*"]
                })
            ]
        });
        let executionRole = new aws_iam_1.Role(this, "executionRole", {
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
            path: "/azmapper/",
            managedPolicies: [
                xrayManagedPolicy,
                ec2ManagedPolicy
            ]
        });
        const file = fs.readFileSync(path.resolve(__dirname, './../azmapper/index.py'), 'utf-8');
        this.function = new aws_lambda_1.Function(this, "AvailabilityZoneMapperFunction", {
            runtime: aws_lambda_1.Runtime.PYTHON_3_12,
            code: aws_lambda_1.Code.fromInline(file),
            handler: "index.handler",
            role: executionRole,
            architecture: aws_lambda_1.Architecture.ARM_64,
            tracing: aws_lambda_1.Tracing.ACTIVE,
            timeout: aws_cdk_lib_1.Duration.seconds(20),
            memorySize: 512,
            environment: {
                "REGION": aws_cdk_lib_1.Fn.ref("AWS::Region"),
                "PARTITION": aws_cdk_lib_1.Fn.ref("AWS::Partition")
            }
        });
        this.logGroup = new aws_logs_1.LogGroup(this, "LogGroup", {
            logGroupName: `/aws/lambda/${this.function.functionName}`,
            retention: aws_logs_1.RetentionDays.ONE_DAY,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY
        });
        new aws_iam_1.ManagedPolicy(this, "CloudWatchManagedPolicy", {
            path: "/azmapper/",
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
                        aws_cdk_lib_1.Fn.sub("arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:") + this.logGroup.logGroupName + ":*"
                    ]
                })
            ],
            roles: [executionRole]
        });
        this.mapper = new aws_cdk_lib_1.CustomResource(this, "AvailabilityZoneMapper", {
            serviceToken: this.function.functionArn,
            properties: props?.availabilityZoneNames !== undefined ? { "AvailabilityZones": props.availabilityZoneNames } : {}
        });
    }
    /**
     * Gets the Availability Zone Id for the given Availability Zone Name in this account
     * @param availabilityZoneName
     * @returns
     */
    availabilityZoneId(availabilityZoneName) {
        return this.mapper.getAttString(availabilityZoneName);
    }
    /**
     * Gets the Availability Zone Name for the given Availability Zone Id in this account
     * @param availabilityZoneId
     * @returns
     */
    availabilityZoneName(availabilityZoneId) {
        return this.mapper.getAttString(availabilityZoneId);
    }
    /**
     * Gets the prefix for the region used with Availability Zone Ids, for example
     * in us-east-1, this returns "use1"
     * @returns
     */
    regionPrefixForAvailabilityZoneIds() {
        return this.mapper.getAttString(aws_cdk_lib_1.Fn.ref("AWS::Region"));
    }
    /**
     * Returns an array for Availability Zone Ids for the supplied Availability Zone names,
     * they are returned in the same order the names were provided
     * @param availabilityZoneNames
     * @returns
     */
    availabilityZoneIdsAsArray(availabilityZoneNames) {
        let ids = [];
        for (let i = 0; i < availabilityZoneNames.length; i++) {
            ids.push(this.availabilityZoneId(availabilityZoneNames[i]));
        }
        return ids;
    }
    /**
     * Returns a comma delimited list of Availability Zone Ids for the supplied
     * Availability Zone names. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Id
     * @param availabilityZoneNames
     * @returns
     */
    availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames) {
        let ids = [];
        for (let i = 0; i < availabilityZoneNames.length; i++) {
            ids.push(this.availabilityZoneId(availabilityZoneNames[i]));
        }
        return ids.join(",");
    }
    /**
     * Returns a comma delimited list of Availability Zone Ids for the supplied
     * Availability Zone names. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Id
     * @returns
     */
    allAvailabilityZoneIdsAsCommaDelimitedList() {
        return this.mapper.getAttString("AllAvailabilityZoneIds");
    }
    /**
     * Returns a reference that can be cast to a string array with all of the
     * Availability Zone Ids
     * @returns
     */
    allAvailabilityZoneIdsAsArray() {
        return this.mapper.getAtt("AllAvailabilityZoneIdsArray");
    }
    /**
     * Given a letter like "f" or "a", returns the Availability Zone Id for that
     * Availability Zone name in this account
     * @param letter
     * @returns
     */
    availabilityZoneIdFromAvailabilityZoneLetter(letter) {
        return this.mapper.getAttString(letter);
    }
    /**
     * Gets all of the Availability Zone names in this Region as a comma delimited
     * list. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Name
     * @returns
     */
    allAvailabilityZoneNamesAsCommaDelimitedList() {
        return this.mapper.getAttString("AllAvailabilityZoneNames");
    }
}
exports.AvailabilityZoneMapper = AvailabilityZoneMapper;
_a = JSII_RTTI_SYMBOL_1;
AvailabilityZoneMapper[_a] = { fqn: "multi-az-observability.AvailabilityZoneMapper", version: "0.1.12" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZhaWxhYmlsaXR5Wm9uZU1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF2YWlsYWJpbGl0eVpvbmVNYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBcUY7QUFDckYsaURBQTRIO0FBQzVILHVEQUFtRztBQUNuRyxtREFBMEU7QUFDMUUsMkNBQXVDO0FBQ3ZDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFJN0I7O0dBRUc7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHNCQUFTO0lBbUJqRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW1DO1FBRXpFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsSUFBSSxpQkFBaUIsR0FBbUIsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNqRixJQUFJLEVBQUUsWUFBWTtZQUNsQixVQUFVLEVBQUU7Z0JBQ1IsSUFBSSx5QkFBZSxDQUFDO29CQUNoQixPQUFPLEVBQUU7d0JBQ0wsdUJBQXVCO3dCQUN2QiwwQkFBMEI7d0JBQzFCLHVCQUF1Qjt3QkFDdkIseUJBQXlCO3dCQUN6QixvQ0FBb0M7cUJBQ3ZDO29CQUNELE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7b0JBQ3BCLFNBQVMsRUFBRSxDQUFFLEdBQUcsQ0FBRTtpQkFDckIsQ0FBQzthQUNMO1NBQ0osQ0FBQyxDQUFDO1FBRUgsSUFBSSxnQkFBZ0IsR0FBbUIsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMvRSxJQUFJLEVBQUUsWUFBWTtZQUNsQixVQUFVLEVBQUU7Z0JBQ1IsSUFBSSx5QkFBZSxDQUFDO29CQUNoQixPQUFPLEVBQUU7d0JBQ0wsK0JBQStCO3FCQUNsQztvQkFDRCxNQUFNLEVBQUUsZ0JBQU0sQ0FB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QyxNQUFNLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw2QkFBNkI7UUFFekIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILDRDQUE0QyxDQUFDLE1BQWM7UUFFdkQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCw0Q0FBNEM7UUFFeEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7O0FBOU5MLHdEQStOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEN1c3RvbVJlc291cmNlLCBEdXJhdGlvbiwgRm4sIFJlZmVyZW5jZSwgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgRWZmZWN0LCBJTWFuYWdlZFBvbGljeSwgSVJvbGUsIE1hbmFnZWRQb2xpY3ksIFBvbGljeVN0YXRlbWVudCwgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBBcmNoaXRlY3R1cmUsIENvZGUsIEZ1bmN0aW9uLCBJRnVuY3Rpb24sIFJ1bnRpbWUsIFRyYWNpbmcgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgSUxvZ0dyb3VwLCBMb2dHcm91cCwgUmV0ZW50aW9uRGF5cyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmltcG9ydCB7IElBdmFpbGFiaWxpdHlab25lTWFwcGVyIH0gZnJvbSBcIi4vSUF2YWlsYWJpbGl0eVpvbmVNYXBwZXJcIjtcbmltcG9ydCB7IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXJQcm9wcyB9IGZyb20gXCIuL0F2YWlsYWJpbGl0eVpvbmVNYXBwZXJQcm9wc1wiO1xuXG4vKipcbiAqIEEgY29uc3RydWN0IHRoYXQgYWxsb3dzIHlvdSB0byBtYXAgQVogbmFtZXMgdG8gaWRzIGFuZCBiYWNrXG4gKi9cbmV4cG9ydCBjbGFzcyBBdmFpbGFiaWxpdHlab25lTWFwcGVyIGV4dGVuZHMgQ29uc3RydWN0IGltcGxlbWVudHMgSUF2YWlsYWJpbGl0eVpvbmVNYXBwZXJcbntcbiAgICAvKipcbiAgICAgKiBUaGUgZnVuY3Rpb24gdGhhdCBkb2VzIHRoZSBtYXBwaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb246IElGdW5jdGlvbjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBsb2cgZ3JvdXAgZm9yIHRoZSBmdW5jdGlvbidzIGxvZ3NcbiAgICAgKi9cbiAgICBsb2dHcm91cDogSUxvZ0dyb3VwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGN1c3RvbSByZXNvdXJjZSB0aGF0IGNhbiBiZSByZWZlcmVuY2VkIHRvIHVzZVxuICAgICAqIEZuOjpHZXRBdHQgZnVuY3Rpb25zIG9uIHRvIHJldHJpZXZlIGF2YWlsYWJpbGl0eSB6b25lXG4gICAgICogbmFtZXMgYW5kIGlkc1xuICAgICAqL1xuICAgIG1hcHBlcjogQ3VzdG9tUmVzb3VyY2U7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IEF2YWlsYWJpbGl0eVpvbmVNYXBwZXJQcm9wcylcbiAgICB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgICAgIGxldCB4cmF5TWFuYWdlZFBvbGljeTogSU1hbmFnZWRQb2xpY3kgPSBuZXcgTWFuYWdlZFBvbGljeSh0aGlzLCBcIlhyYXlNYW5hZ2VkUG9saWN5XCIsIHtcbiAgICAgICAgICAgIHBhdGg6IFwiL2F6bWFwcGVyL1wiLFxuICAgICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoeyBcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OlB1dFRyYWNlU2VnbWVudHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieHJheTpQdXRUZWxlbWV0cnlSZWNvcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInhyYXk6R2V0U2FtcGxpbmdSdWxlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OkdldFNhbXBsaW5nVGFyZ2V0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4cmF5OkdldFNhbXBsaW5nU3RhdGlzdGljU3VtbWFyaWVzXCJcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogWyBcIipcIiBdXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVjMk1hbmFnZWRQb2xpY3k6IElNYW5hZ2VkUG9saWN5ID0gbmV3IE1hbmFnZWRQb2xpY3kodGhpcywgXCJFQzJNYW5hZ2VkUG9saWN5XCIsIHtcbiAgICAgICAgICAgIHBhdGg6IFwiL2F6bWFwcGVyL1wiLFxuICAgICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoeyBcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVBdmFpbGFiaWxpdHlab25lc1wiXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsgXCIqXCIgXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBleGVjdXRpb25Sb2xlOiBJUm9sZSA9IG5ldyBSb2xlKHRoaXMsIFwiZXhlY3V0aW9uUm9sZVwiLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICAgICAgICBwYXRoOiBcIi9hem1hcHBlci9cIixcbiAgICAgICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgICAgICAgIHhyYXlNYW5hZ2VkUG9saWN5LFxuICAgICAgICAgICAgICAgIGVjMk1hbmFnZWRQb2xpY3lcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7IFxuICAgICAgICBcbiAgICAgICAgY29uc3QgZmlsZTogc3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLy4uL2F6bWFwcGVyL2luZGV4LnB5JyksICd1dGYtOCcpO1xuXG4gICAgICAgIHRoaXMuZnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJBdmFpbGFiaWxpdHlab25lTWFwcGVyRnVuY3Rpb25cIiwge1xuICAgICAgICAgICAgcnVudGltZTogUnVudGltZS5QWVRIT05fM18xMixcbiAgICAgICAgICAgIGNvZGU6IENvZGUuZnJvbUlubGluZShmaWxlKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgcm9sZTogZXhlY3V0aW9uUm9sZSxcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTogQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgICAgIHRyYWNpbmc6IFRyYWNpbmcuQUNUSVZFLFxuICAgICAgICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygyMCksXG4gICAgICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIFwiUkVHSU9OXCI6IEZuLnJlZihcIkFXUzo6UmVnaW9uXCIpLFxuICAgICAgICAgICAgICAgIFwiUEFSVElUSU9OXCI6IEZuLnJlZihcIkFXUzo6UGFydGl0aW9uXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubG9nR3JvdXAgPSBuZXcgTG9nR3JvdXAodGhpcywgXCJMb2dHcm91cFwiLCB7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2xhbWJkYS8ke3RoaXMuZnVuY3Rpb24uZnVuY3Rpb25OYW1lfWAsXG4gICAgICAgICAgICByZXRlbnRpb246IFJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWVxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgTWFuYWdlZFBvbGljeSh0aGlzLCBcIkNsb3VkV2F0Y2hNYW5hZ2VkUG9saWN5XCIsIHtcbiAgICAgICAgICAgIHBhdGg6IFwiL2F6bWFwcGVyL1wiLFxuICAgICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoeyBcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbG91ZHdhdGNoOlB1dE1ldHJpY0RhdGFcIlxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbIFwiKlwiIF1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHsgXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nczpDcmVhdGVMb2dTdHJlYW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nczpQdXRMb2dFdmVudHNcIlxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOlsgXG4gICAgICAgICAgICAgICAgICAgICAgICBGbi5zdWIoXCJhcm46JHtBV1M6OlBhcnRpdGlvbn06bG9nczoke0FXUzo6UmVnaW9ufToke0FXUzo6QWNjb3VudElkfTpsb2ctZ3JvdXA6XCIpICsgdGhpcy5sb2dHcm91cC5sb2dHcm91cE5hbWUgKyBcIjoqXCJcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcm9sZXM6IFsgZXhlY3V0aW9uUm9sZSBdXG4gICAgICAgIH0pOyAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcHBlciA9IG5ldyBDdXN0b21SZXNvdXJjZSh0aGlzLCBcIkF2YWlsYWJpbGl0eVpvbmVNYXBwZXJcIiwge1xuICAgICAgICAgICAgc2VydmljZVRva2VuOiB0aGlzLmZ1bmN0aW9uLmZ1bmN0aW9uQXJuLFxuICAgICAgICAgICAgcHJvcGVydGllczogcHJvcHM/LmF2YWlsYWJpbGl0eVpvbmVOYW1lcyAhPT0gdW5kZWZpbmVkID8geyBcIkF2YWlsYWJpbGl0eVpvbmVzXCI6IHByb3BzLmF2YWlsYWJpbGl0eVpvbmVOYW1lc30gOiB7fVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBBdmFpbGFiaWxpdHkgWm9uZSBJZCBmb3IgdGhlIGdpdmVuIEF2YWlsYWJpbGl0eSBab25lIE5hbWUgaW4gdGhpcyBhY2NvdW50XG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVOYW1lIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGF2YWlsYWJpbGl0eVpvbmVJZChhdmFpbGFiaWxpdHlab25lTmFtZTogc3RyaW5nKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXBwZXIuZ2V0QXR0U3RyaW5nKGF2YWlsYWJpbGl0eVpvbmVOYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBBdmFpbGFiaWxpdHkgWm9uZSBOYW1lIGZvciB0aGUgZ2l2ZW4gQXZhaWxhYmlsaXR5IFpvbmUgSWQgaW4gdGhpcyBhY2NvdW50XG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVJZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBhdmFpbGFiaWxpdHlab25lTmFtZShhdmFpbGFiaWxpdHlab25lSWQ6IHN0cmluZyk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwcGVyLmdldEF0dFN0cmluZyhhdmFpbGFiaWxpdHlab25lSWQpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgcHJlZml4IGZvciB0aGUgcmVnaW9uIHVzZWQgd2l0aCBBdmFpbGFiaWxpdHkgWm9uZSBJZHMsIGZvciBleGFtcGxlXG4gICAgICogaW4gdXMtZWFzdC0xLCB0aGlzIHJldHVybnMgXCJ1c2UxXCJcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICByZWdpb25QcmVmaXhGb3JBdmFpbGFiaWxpdHlab25lSWRzKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwcGVyLmdldEF0dFN0cmluZyhGbi5yZWYoXCJBV1M6OlJlZ2lvblwiKSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGZvciBBdmFpbGFiaWxpdHkgWm9uZSBJZHMgZm9yIHRoZSBzdXBwbGllZCBBdmFpbGFiaWxpdHkgWm9uZSBuYW1lcyxcbiAgICAgKiB0aGV5IGFyZSByZXR1cm5lZCBpbiB0aGUgc2FtZSBvcmRlciB0aGUgbmFtZXMgd2VyZSBwcm92aWRlZFxuICAgICAqIEBwYXJhbSBhdmFpbGFiaWxpdHlab25lTmFtZXMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgYXZhaWxhYmlsaXR5Wm9uZUlkc0FzQXJyYXkoYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiBzdHJpbmdbXSk6IHN0cmluZ1tdXG4gICAge1xuICAgICAgICBsZXQgaWRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXZhaWxhYmlsaXR5Wm9uZU5hbWVzLmxlbmd0aDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZHMucHVzaCh0aGlzLmF2YWlsYWJpbGl0eVpvbmVJZChhdmFpbGFiaWxpdHlab25lTmFtZXNbaV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGNvbW1hIGRlbGltaXRlZCBsaXN0IG9mIEF2YWlsYWJpbGl0eSBab25lIElkcyBmb3IgdGhlIHN1cHBsaWVkXG4gICAgICogQXZhaWxhYmlsaXR5IFpvbmUgbmFtZXMuIFlvdSBjYW4gdXNlIHRoaXMgc3RyaW5nIHdpdGggRm4uU2VsZWN0KHgsIEZuLlNwbGl0KFwiLFwiLCBhenMpKSB0b1xuICAgICAqIGdldCBhIHNwZWNpZmljIEF2YWlsYWJpbGl0eSBab25lIElkXG4gICAgICogQHBhcmFtIGF2YWlsYWJpbGl0eVpvbmVOYW1lcyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBhdmFpbGFiaWxpdHlab25lSWRzQXNDb21tYURlbGltaXRlZExpc3QoYXZhaWxhYmlsaXR5Wm9uZU5hbWVzOiBzdHJpbmdbXSk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgbGV0IGlkczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF2YWlsYWJpbGl0eVpvbmVOYW1lcy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgaWRzLnB1c2godGhpcy5hdmFpbGFiaWxpdHlab25lSWQoYXZhaWxhYmlsaXR5Wm9uZU5hbWVzW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWRzLmpvaW4oXCIsXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBjb21tYSBkZWxpbWl0ZWQgbGlzdCBvZiBBdmFpbGFiaWxpdHkgWm9uZSBJZHMgZm9yIHRoZSBzdXBwbGllZFxuICAgICAqIEF2YWlsYWJpbGl0eSBab25lIG5hbWVzLiBZb3UgY2FuIHVzZSB0aGlzIHN0cmluZyB3aXRoIEZuLlNlbGVjdCh4LCBGbi5TcGxpdChcIixcIiwgYXpzKSkgdG9cbiAgICAgKiBnZXQgYSBzcGVjaWZpYyBBdmFpbGFiaWxpdHkgWm9uZSBJZFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGFsbEF2YWlsYWJpbGl0eVpvbmVJZHNBc0NvbW1hRGVsaW1pdGVkTGlzdCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcHBlci5nZXRBdHRTdHJpbmcoXCJBbGxBdmFpbGFiaWxpdHlab25lSWRzXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdGhhdCBjYW4gYmUgY2FzdCB0byBhIHN0cmluZyBhcnJheSB3aXRoIGFsbCBvZiB0aGUgXG4gICAgICogQXZhaWxhYmlsaXR5IFpvbmUgSWRzXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgYWxsQXZhaWxhYmlsaXR5Wm9uZUlkc0FzQXJyYXkoKTogUmVmZXJlbmNlXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXBwZXIuZ2V0QXR0KFwiQWxsQXZhaWxhYmlsaXR5Wm9uZUlkc0FycmF5XCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgbGV0dGVyIGxpa2UgXCJmXCIgb3IgXCJhXCIsIHJldHVybnMgdGhlIEF2YWlsYWJpbGl0eSBab25lIElkIGZvciB0aGF0IFxuICAgICAqIEF2YWlsYWJpbGl0eSBab25lIG5hbWUgaW4gdGhpcyBhY2NvdW50XG4gICAgICogQHBhcmFtIGxldHRlciBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBhdmFpbGFiaWxpdHlab25lSWRGcm9tQXZhaWxhYmlsaXR5Wm9uZUxldHRlcihsZXR0ZXI6IHN0cmluZyk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwcGVyLmdldEF0dFN0cmluZyhsZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYWxsIG9mIHRoZSBBdmFpbGFiaWxpdHkgWm9uZSBuYW1lcyBpbiB0aGlzIFJlZ2lvbiBhcyBhIGNvbW1hIGRlbGltaXRlZFxuICAgICAqIGxpc3QuIFlvdSBjYW4gdXNlIHRoaXMgc3RyaW5nIHdpdGggRm4uU2VsZWN0KHgsIEZuLlNwbGl0KFwiLFwiLCBhenMpKSB0b1xuICAgICAqIGdldCBhIHNwZWNpZmljIEF2YWlsYWJpbGl0eSBab25lIE5hbWVcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBhbGxBdmFpbGFiaWxpdHlab25lTmFtZXNBc0NvbW1hRGVsaW1pdGVkTGlzdCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcHBlci5nZXRBdHRTdHJpbmcoXCJBbGxBdmFpbGFiaWxpdHlab25lTmFtZXNcIik7XG4gICAgfVxufSJdfQ==