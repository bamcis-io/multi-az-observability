import { CustomResource, Duration, Fn, Reference, RemovalPolicy } from "aws-cdk-lib";
import { Effect, IManagedPolicy, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Architecture, Code, Function, IFunction, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { ILogGroup, LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { readFileSync } from 'fs';
import path = require("path");

export class AvailabilityZoneMapper extends Construct
{
    function: IFunction;
    logGroup: ILogGroup;
    availabilityZoneMapper: CustomResource;

    constructor(scope: Construct, id: string)
    {
        super(scope, id);
        let xrayManagedPolicy: IManagedPolicy = new ManagedPolicy(this, "XrayManagedPolicy", {
            path: "/azmapper/",
            statements: [
                new PolicyStatement({ 
                    actions: [
                        "xray:PutTraceSegments",
                        "xray:PutTelemetryRecords",
                        "xray:GetSamplingRules",
                        "xray:GetSamplingTargets",
                        "xray:GetSamplingStatisticSummaries"
                    ],
                    effect: Effect.ALLOW,
                    resources: [ "*" ]
                })
            ]
        });

        let ec2ManagedPolicy: IManagedPolicy = new ManagedPolicy(this, "EC2ManagedPolicy", {
            path: "/azmapper/",
            statements: [
                new PolicyStatement({ 
                    actions: [
                        "ec2:DescribeAvailabilityZones"
                    ],
                    effect: Effect.ALLOW,
                    resources: [ "*" ]
                })
            ]
        });

        let executionRole: IRole = new Role(this, "executionRole", {
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            path: "/azmapper/",
            managedPolicies: [
                xrayManagedPolicy,
                ec2ManagedPolicy
            ]
        }); 
        
        const file: string = readFileSync(path.resolve(__dirname, './../azmapper/index.py'), 'utf-8');

        this.function = new Function(this, "AvailabilityZoneMapperFunction", {
            runtime: Runtime.PYTHON_3_12,
            code: Code.fromInline(file),
            handler: "index.handler",
            role: executionRole,
            architecture: Architecture.ARM_64,
            tracing: Tracing.ACTIVE,
            timeout: Duration.seconds(20),
            memorySize: 512,
            environment: {
                "REGION": Fn.ref("AWS::Region"),
                "PARTITION": Fn.ref("AWS::Partition")
            }
        });

        this.logGroup = new LogGroup(this, "LogGroup", {
            logGroupName: `/aws/lambda/${this.function.functionName}`,
            retention: RetentionDays.ONE_DAY,
            removalPolicy: RemovalPolicy.DESTROY
        });

        new ManagedPolicy(this, "CloudWatchManagedPolicy", {
            path: "/azmapper/",
            statements: [
                new PolicyStatement({ 
                    actions: [
                        "cloudwatch:PutMetricData"
                    ],
                    effect: Effect.ALLOW,
                    resources: [ "*" ]
                }),
                new PolicyStatement({ 
                    actions: [
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    effect: Effect.ALLOW,
                    resources:[ 
                        Fn.sub("arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:") + this.logGroup.logGroupName + ":*"
                    ]
                })
            ],
            roles: [ executionRole ]
        });  
        
        this.availabilityZoneMapper = new CustomResource(this, "AvailabilityZoneMapper", {
            serviceToken: this.function.functionArn
        });
    }

    /**
     * Gets the Availability Zone Id for the given Availability Zone Name in this account
     * @param availabilityZoneName 
     * @returns 
     */
    getAvailabilityZoneId(availabilityZoneName: string): string
    {
        return this.availabilityZoneMapper.getAttString(availabilityZoneName);
    }

    /**
     * Gets the Availability Zone Name for the given Availability Zone Id in this account
     * @param availabilityZoneId 
     * @returns 
     */
    getAvailabilityZoneName(availabilityZoneId: string): string
    {
        return this.availabilityZoneMapper.getAttString(availabilityZoneId)
    }

    /**
     * Gets the prefix for the region used with Availability Zone Ids, for example
     * in us-east-1, this returns "use1"
     * @returns 
     */
    getRegionPrefixForAvailabilityZoneIds(): string
    {
        return this.availabilityZoneMapper.getAttString(Fn.ref("AWS::Region"))
    }

    /**
     * Returns an array for Availability Zone Ids for the supplied Availability Zone names,
     * they are returned in the same order the names were provided
     * @param availabilityZoneNames 
     * @returns 
     */
    getAvailabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[]
    {
        let ids: string[] = [];

        for (let i = 0; i < availabilityZoneNames.length; i++)
        {
            ids.push(this.getAvailabilityZoneId(availabilityZoneNames[i]));
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
    getAvailabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string
    {
        let ids: string[] = [];

        for (let i = 0; i < availabilityZoneNames.length; i++)
        {
            ids.push(this.getAvailabilityZoneId(availabilityZoneNames[i]));
        }

        return ids.join(",");
    }

    /**
     * Returns a comma delimited list of Availability Zone Ids for the supplied
     * Availability Zone names. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Id
     * @returns 
     */
    getAllAvailabilityZoneIdsAsCommaDelimitedList(): string
    {
        return this.availabilityZoneMapper.getAttString("AllAvailabilityZoneIds");
    }

    /**
     * Returns a reference that can be cast to a string array with all of the 
     * Availability Zone Ids
     * @returns 
     */
    getAllAvailabilityZoneIdsAsArray(): Reference
    {
        return this.availabilityZoneMapper.getAtt("AllAvailabilityZoneIdsArray");
    }

    /**
     * Given a letter like "f" or "a", returns the Availability Zone Id for that 
     * Availability Zone name in this account
     * @param letter 
     * @returns 
     */
    getAvailabilityZoneIdFromAvailabilityZoneLetter(letter: string): string
    {
        return this.availabilityZoneMapper.getAttString(letter);
    }

    /**
     * Gets all of the Availability Zone names in this Region as a comma delimited
     * list. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Name
     * @returns 
     */
    getAllAvailabilityZoneNamesAsCommaDelimitedList(): string
    {
        return this.availabilityZoneMapper.getAttString("AllAvailabilityZoneNames");
    }
}