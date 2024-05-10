# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AvailabilityZoneMapper <a name="AvailabilityZoneMapper" id="multi-az-observability.AvailabilityZoneMapper"></a>

- *Implements:* <a href="#multi-az-observability.IAvailabilityZoneMapper">IAvailabilityZoneMapper</a>

A construct that allows you to map AZ names to ids and back.

#### Initializers <a name="Initializers" id="multi-az-observability.AvailabilityZoneMapper.Initializer"></a>

```typescript
import { AvailabilityZoneMapper } from 'multi-az-observability'

new AvailabilityZoneMapper(scope: Construct, id: string, props?: AvailabilityZoneMapperProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.AvailabilityZoneMapperProps">AvailabilityZoneMapperProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.AvailabilityZoneMapperProps">AvailabilityZoneMapperProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsArray">allAvailabilityZoneIdsAsArray</a></code> | Returns a reference that can be cast to a string array with all of the Availability Zone Ids. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList">allAvailabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList">allAvailabilityZoneNamesAsCommaDelimitedList</a></code> | Gets all of the Availability Zone names in this Region as a comma delimited list. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.availabilityZoneId">availabilityZoneId</a></code> | Gets the Availability Zone Id for the given Availability Zone Name in this account. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter">availabilityZoneIdFromAvailabilityZoneLetter</a></code> | Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray">availabilityZoneIdsAsArray</a></code> | Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList">availabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.availabilityZoneName">availabilityZoneName</a></code> | Gets the Availability Zone Name for the given Availability Zone Id in this account. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds">regionPrefixForAvailabilityZoneIds</a></code> | Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1". |

---

##### `toString` <a name="toString" id="multi-az-observability.AvailabilityZoneMapper.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `allAvailabilityZoneIdsAsArray` <a name="allAvailabilityZoneIdsAsArray" id="multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsArray"></a>

```typescript
public allAvailabilityZoneIdsAsArray(): Reference
```

Returns a reference that can be cast to a string array with all of the Availability Zone Ids.

##### `allAvailabilityZoneIdsAsCommaDelimitedList` <a name="allAvailabilityZoneIdsAsCommaDelimitedList" id="multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneIdsAsCommaDelimitedList(): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

##### `allAvailabilityZoneNamesAsCommaDelimitedList` <a name="allAvailabilityZoneNamesAsCommaDelimitedList" id="multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneNamesAsCommaDelimitedList(): string
```

Gets all of the Availability Zone names in this Region as a comma delimited list.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Name

##### `availabilityZoneId` <a name="availabilityZoneId" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneId"></a>

```typescript
public availabilityZoneId(availabilityZoneName: string): string
```

Gets the Availability Zone Id for the given Availability Zone Name in this account.

###### `availabilityZoneName`<sup>Required</sup> <a name="availabilityZoneName" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneId.parameter.availabilityZoneName"></a>

- *Type:* string

---

##### `availabilityZoneIdFromAvailabilityZoneLetter` <a name="availabilityZoneIdFromAvailabilityZoneLetter" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter"></a>

```typescript
public availabilityZoneIdFromAvailabilityZoneLetter(letter: string): string
```

Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account.

###### `letter`<sup>Required</sup> <a name="letter" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter.parameter.letter"></a>

- *Type:* string

---

##### `availabilityZoneIdsAsArray` <a name="availabilityZoneIdsAsArray" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray"></a>

```typescript
public availabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[]
```

Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided.

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneIdsAsCommaDelimitedList` <a name="availabilityZoneIdsAsCommaDelimitedList" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneName` <a name="availabilityZoneName" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneName"></a>

```typescript
public availabilityZoneName(availabilityZoneId: string): string
```

Gets the Availability Zone Name for the given Availability Zone Id in this account.

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="multi-az-observability.AvailabilityZoneMapper.availabilityZoneName.parameter.availabilityZoneId"></a>

- *Type:* string

---

##### `regionPrefixForAvailabilityZoneIds` <a name="regionPrefixForAvailabilityZoneIds" id="multi-az-observability.AvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds"></a>

```typescript
public regionPrefixForAvailabilityZoneIds(): string
```

Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1".

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="multi-az-observability.AvailabilityZoneMapper.isConstruct"></a>

```typescript
import { AvailabilityZoneMapper } from 'multi-az-observability'

AvailabilityZoneMapper.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="multi-az-observability.AvailabilityZoneMapper.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The function that does the mapping. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group for the function's logs. |
| <code><a href="#multi-az-observability.AvailabilityZoneMapper.property.mapper">mapper</a></code> | <code>aws-cdk-lib.CustomResource</code> | The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids. |

---

##### `node`<sup>Required</sup> <a name="node" id="multi-az-observability.AvailabilityZoneMapper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="multi-az-observability.AvailabilityZoneMapper.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The function that does the mapping.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="multi-az-observability.AvailabilityZoneMapper.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The log group for the function's logs.

---

##### `mapper`<sup>Required</sup> <a name="mapper" id="multi-az-observability.AvailabilityZoneMapper.property.mapper"></a>

```typescript
public readonly mapper: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids.

---


### MultiAvailabilityZoneObservability <a name="MultiAvailabilityZoneObservability" id="multi-az-observability.MultiAvailabilityZoneObservability"></a>

- *Implements:* <a href="#multi-az-observability.IMultiAvailabilityZoneObservability">IMultiAvailabilityZoneObservability</a>

The construct will create multi-AZ observability for your service based on the parameters you provide.

It will create alarms that indicate if a single AZ is
impacted so you can take appropriate action to mitigate the event, for example,
using zonal shift. It will also optionally create dashboards for your service so
you can visualize the metrics used to feed the alarms as well as the alarm states.

#### Initializers <a name="Initializers" id="multi-az-observability.MultiAvailabilityZoneObservability.Initializer"></a>

```typescript
import { MultiAvailabilityZoneObservability } from 'multi-az-observability'

new MultiAvailabilityZoneObservability(scope: Construct, id: string, props?: MultiAvailabilityZoneObservabilityProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.MultiAvailabilityZoneObservabilityProps">MultiAvailabilityZoneObservabilityProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="multi-az-observability.MultiAvailabilityZoneObservability.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.MultiAvailabilityZoneObservabilityProps">MultiAvailabilityZoneObservabilityProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="multi-az-observability.MultiAvailabilityZoneObservability.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="multi-az-observability.MultiAvailabilityZoneObservability.isConstruct"></a>

```typescript
import { MultiAvailabilityZoneObservability } from 'multi-az-observability'

MultiAvailabilityZoneObservability.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="multi-az-observability.MultiAvailabilityZoneObservability.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="multi-az-observability.MultiAvailabilityZoneObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### AddCanaryTestProps <a name="AddCanaryTestProps" id="multi-az-observability.AddCanaryTestProps"></a>

The props for requesting a canary be made for an operation.

#### Initializer <a name="Initializer" id="multi-az-observability.AddCanaryTestProps.Initializer"></a>

```typescript
import { AddCanaryTestProps } from 'multi-az-observability'

const addCanaryTestProps: AddCanaryTestProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer that will be tested against. |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.requestCount">requestCount</a></code> | <code>number</code> | The number of requests to send on each test. |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.schedule">schedule</a></code> | <code>string</code> | A schedule expression. |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.headers">headers</a></code> | <code>{[ key: string ]: string}</code> | Any headers to include. |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | Defining this will override the methods defined in the operation and will use these instead. |
| <code><a href="#multi-az-observability.AddCanaryTestProps.property.postData">postData</a></code> | <code>string</code> | Data to supply in a POST, PUT, or PATCH operation. |

---

##### `loadBalancer`<sup>Required</sup> <a name="loadBalancer" id="multi-az-observability.AddCanaryTestProps.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2

The load balancer that will be tested against.

---

##### `requestCount`<sup>Required</sup> <a name="requestCount" id="multi-az-observability.AddCanaryTestProps.property.requestCount"></a>

```typescript
public readonly requestCount: number;
```

- *Type:* number

The number of requests to send on each test.

---

##### `schedule`<sup>Required</sup> <a name="schedule" id="multi-az-observability.AddCanaryTestProps.property.schedule"></a>

```typescript
public readonly schedule: string;
```

- *Type:* string

A schedule expression.

---

##### `headers`<sup>Optional</sup> <a name="headers" id="multi-az-observability.AddCanaryTestProps.property.headers"></a>

```typescript
public readonly headers: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No additional headers are added to the requests

Any headers to include.

---

##### `httpMethods`<sup>Optional</sup> <a name="httpMethods" id="multi-az-observability.AddCanaryTestProps.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]
- *Default:* The operation's defined HTTP methods will be used to conduct the canary tests

Defining this will override the methods defined in the operation and will use these instead.

---

##### `postData`<sup>Optional</sup> <a name="postData" id="multi-az-observability.AddCanaryTestProps.property.postData"></a>

```typescript
public readonly postData: string;
```

- *Type:* string
- *Default:* No data is sent in a POST, PUT, or PATCH request

Data to supply in a POST, PUT, or PATCH operation.

---

### AvailabilityZoneMapperProps <a name="AvailabilityZoneMapperProps" id="multi-az-observability.AvailabilityZoneMapperProps"></a>

Properties for the AZ mapper.

#### Initializer <a name="Initializer" id="multi-az-observability.AvailabilityZoneMapperProps.Initializer"></a>

```typescript
import { AvailabilityZoneMapperProps } from 'multi-az-observability'

const availabilityZoneMapperProps: AvailabilityZoneMapperProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.AvailabilityZoneMapperProps.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | The currently in use Availability Zone names which constrains the list of AZ IDs that are returned. |

---

##### `availabilityZoneNames`<sup>Optional</sup> <a name="availabilityZoneNames" id="multi-az-observability.AvailabilityZoneMapperProps.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]
- *Default:* No names are provided and the mapper returns all AZs in the region in its lists

The currently in use Availability Zone names which constrains the list of AZ IDs that are returned.

---

### BasicServiceMultiAZObservabilityProps <a name="BasicServiceMultiAZObservabilityProps" id="multi-az-observability.BasicServiceMultiAZObservabilityProps"></a>

Properties for creating a basic service.

#### Initializer <a name="Initializer" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.Initializer"></a>

```typescript
import { BasicServiceMultiAZObservabilityProps } from 'multi-az-observability'

const basicServiceMultiAZObservabilityProps: BasicServiceMultiAZObservabilityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.createDashboard">createDashboard</a></code> | <code>boolean</code> | Whether to create a dashboard displaying the metrics and alarms. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.outlierDetectionAlgorithm">outlierDetectionAlgorithm</a></code> | <code><a href="#multi-az-observability.OutlierDetectionAlgorithm">OutlierDetectionAlgorithm</a></code> | The algorithm to use for performing outlier detection. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.outlierThreshold">outlierThreshold</a></code> | <code>number</code> | The threshold for percentage of errors or packet loss to determine if an AZ is an outlier, should be a number between 0 and 1. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period to evaluate metrics. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.serviceName">serviceName</a></code> | <code>string</code> | The service's name. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.applicationLoadBalancers">applicationLoadBalancers</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]</code> | The application load balancers being used by the service. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.faultCountPercentageThreshold">faultCountPercentageThreshold</a></code> | <code>number</code> | The percentage of faults for a single ALB to consider an AZ to be unhealthy, this should align with your availability goal. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.interval">interval</a></code> | <code>aws-cdk-lib.Duration</code> | Dashboard interval. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.natGateways">natGateways</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}</code> | (Optional) A map of Availability Zone name to the NAT Gateways in that AZ. |
| <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps.property.packetLossImpactPercentageThreshold">packetLossImpactPercentageThreshold</a></code> | <code>number</code> | The amount of packet loss in a NAT GW to determine if an AZ is actually impacted, recommendation is 0.01%. |

---

##### `createDashboard`<sup>Required</sup> <a name="createDashboard" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.createDashboard"></a>

```typescript
public readonly createDashboard: boolean;
```

- *Type:* boolean

Whether to create a dashboard displaying the metrics and alarms.

---

##### `outlierDetectionAlgorithm`<sup>Required</sup> <a name="outlierDetectionAlgorithm" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.outlierDetectionAlgorithm"></a>

```typescript
public readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;
```

- *Type:* <a href="#multi-az-observability.OutlierDetectionAlgorithm">OutlierDetectionAlgorithm</a>

The algorithm to use for performing outlier detection.

---

##### `outlierThreshold`<sup>Required</sup> <a name="outlierThreshold" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.outlierThreshold"></a>

```typescript
public readonly outlierThreshold: number;
```

- *Type:* number

The threshold for percentage of errors or packet loss to determine if an AZ is an outlier, should be a number between 0 and 1.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period to evaluate metrics.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The service's name.

---

##### `applicationLoadBalancers`<sup>Optional</sup> <a name="applicationLoadBalancers" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.applicationLoadBalancers"></a>

```typescript
public readonly applicationLoadBalancers: IApplicationLoadBalancer[];
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]
- *Default:* No alarms for ALBs will be created

The application load balancers being used by the service.

---

##### `faultCountPercentageThreshold`<sup>Optional</sup> <a name="faultCountPercentageThreshold" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.faultCountPercentageThreshold"></a>

```typescript
public readonly faultCountPercentageThreshold: number;
```

- *Type:* number
- *Default:* 5 (as in 5%)

The percentage of faults for a single ALB to consider an AZ to be unhealthy, this should align with your availability goal.

For example
1% or 5%.

---

##### `interval`<sup>Optional</sup> <a name="interval" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.interval"></a>

```typescript
public readonly interval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 1 hour

Dashboard interval.

---

##### `natGateways`<sup>Optional</sup> <a name="natGateways" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.natGateways"></a>

```typescript
public readonly natGateways: {[ key: string ]: CfnNatGateway[]};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}
- *Default:* No alarms for NAT Gateways will be created

(Optional) A map of Availability Zone name to the NAT Gateways in that AZ.

---

##### `packetLossImpactPercentageThreshold`<sup>Optional</sup> <a name="packetLossImpactPercentageThreshold" id="multi-az-observability.BasicServiceMultiAZObservabilityProps.property.packetLossImpactPercentageThreshold"></a>

```typescript
public readonly packetLossImpactPercentageThreshold: number;
```

- *Type:* number
- *Default:* 0.01 (as in 0.01%)

The amount of packet loss in a NAT GW to determine if an AZ is actually impacted, recommendation is 0.01%.

---

### CanaryMetricProps <a name="CanaryMetricProps" id="multi-az-observability.CanaryMetricProps"></a>

Properties for canary metrics in an operation.

#### Initializer <a name="Initializer" id="multi-az-observability.CanaryMetricProps.Initializer"></a>

```typescript
import { CanaryMetricProps } from 'multi-az-observability'

const canaryMetricProps: CanaryMetricProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.CanaryMetricProps.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#multi-az-observability.CanaryMetricProps.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |
| <code><a href="#multi-az-observability.CanaryMetricProps.property.canaryContributorInsightRuleDetails">canaryContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The canary details for contributor insights rules. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="multi-az-observability.CanaryMetricProps.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="multi-az-observability.CanaryMetricProps.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---

##### `canaryContributorInsightRuleDetails`<sup>Optional</sup> <a name="canaryContributorInsightRuleDetails" id="multi-az-observability.CanaryMetricProps.property.canaryContributorInsightRuleDetails"></a>

```typescript
public readonly canaryContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No contributor insight rules will be created

The canary details for contributor insights rules.

---

### ContributorInsightRuleDetailsProps <a name="ContributorInsightRuleDetailsProps" id="multi-az-observability.ContributorInsightRuleDetailsProps"></a>

The contributor insight rule details properties.

#### Initializer <a name="Initializer" id="multi-az-observability.ContributorInsightRuleDetailsProps.Initializer"></a>

```typescript
import { ContributorInsightRuleDetailsProps } from 'multi-az-observability'

const contributorInsightRuleDetailsProps: ContributorInsightRuleDetailsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="multi-az-observability.ContributorInsightRuleDetailsProps.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---

### InstrumentedServiceMultiAZObservabilityProps <a name="InstrumentedServiceMultiAZObservabilityProps" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps"></a>

The properties for adding alarms and dashboards for an instrumented service.

#### Initializer <a name="Initializer" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.Initializer"></a>

```typescript
import { InstrumentedServiceMultiAZObservabilityProps } from 'multi-az-observability'

const instrumentedServiceMultiAZObservabilityProps: InstrumentedServiceMultiAZObservabilityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer used by the service. |
| <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierThreshold">outlierThreshold</a></code> | <code>number</code> | The threshold as a percentage between 0 and 1 on when to consider an AZ as an outlier for faults or high latency responses. |
| <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.service">service</a></code> | <code><a href="#multi-az-observability.IService">IService</a></code> | The service that the alarms and dashboards are being crated for. |
| <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.createDashboards">createDashboards</a></code> | <code>boolean</code> | Indicates whether to create per operation and overall service dashboards. |
| <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.interval">interval</a></code> | <code>aws-cdk-lib.Duration</code> | The interval used in the dashboard, defaults to 60 minutes. |

---

##### `loadBalancer`<sup>Required</sup> <a name="loadBalancer" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2

The load balancer used by the service.

---

##### `outlierThreshold`<sup>Required</sup> <a name="outlierThreshold" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierThreshold"></a>

```typescript
public readonly outlierThreshold: number;
```

- *Type:* number

The threshold as a percentage between 0 and 1 on when to consider an AZ as an outlier for faults or high latency responses.

---

##### `service`<sup>Required</sup> <a name="service" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#multi-az-observability.IService">IService</a>

The service that the alarms and dashboards are being crated for.

---

##### `createDashboards`<sup>Optional</sup> <a name="createDashboards" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.createDashboards"></a>

```typescript
public readonly createDashboards: boolean;
```

- *Type:* boolean
- *Default:* No dashboards are created

Indicates whether to create per operation and overall service dashboards.

---

##### `interval`<sup>Optional</sup> <a name="interval" id="multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.interval"></a>

```typescript
public readonly interval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 60 minutes

The interval used in the dashboard, defaults to 60 minutes.

---

### MultiAvailabilityZoneObservabilityProps <a name="MultiAvailabilityZoneObservabilityProps" id="multi-az-observability.MultiAvailabilityZoneObservabilityProps"></a>

The properties for creating multi-AZ observability alarms and dashboards.

#### Initializer <a name="Initializer" id="multi-az-observability.MultiAvailabilityZoneObservabilityProps.Initializer"></a>

```typescript
import { MultiAvailabilityZoneObservabilityProps } from 'multi-az-observability'

const multiAvailabilityZoneObservabilityProps: MultiAvailabilityZoneObservabilityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservabilityProps.property.basicServiceObservabilityProps">basicServiceObservabilityProps</a></code> | <code><a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps">BasicServiceMultiAZObservabilityProps</a></code> | The properties for a basic service that does not emit its own metrics or logs for latency and availability. |
| <code><a href="#multi-az-observability.MultiAvailabilityZoneObservabilityProps.property.instrumentedServiceObservabilityProps">instrumentedServiceObservabilityProps</a></code> | <code><a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps">InstrumentedServiceMultiAZObservabilityProps</a></code> | The properties for a service that has implemented its own instrumentation to emit availability and latency metrics. |

---

##### `basicServiceObservabilityProps`<sup>Optional</sup> <a name="basicServiceObservabilityProps" id="multi-az-observability.MultiAvailabilityZoneObservabilityProps.property.basicServiceObservabilityProps"></a>

```typescript
public readonly basicServiceObservabilityProps: BasicServiceMultiAZObservabilityProps;
```

- *Type:* <a href="#multi-az-observability.BasicServiceMultiAZObservabilityProps">BasicServiceMultiAZObservabilityProps</a>
- *Default:* No basic service observability alarms are created

The properties for a basic service that does not emit its own metrics or logs for latency and availability.

This will create
alarms based on Application Load Balancer metrics and optionally
NAT Gateway metrics to determine single AZ impact. Specify either
this or instrumentedServiceObservabilityProps, but not both.

---

##### `instrumentedServiceObservabilityProps`<sup>Optional</sup> <a name="instrumentedServiceObservabilityProps" id="multi-az-observability.MultiAvailabilityZoneObservabilityProps.property.instrumentedServiceObservabilityProps"></a>

```typescript
public readonly instrumentedServiceObservabilityProps: InstrumentedServiceMultiAZObservabilityProps;
```

- *Type:* <a href="#multi-az-observability.InstrumentedServiceMultiAZObservabilityProps">InstrumentedServiceMultiAZObservabilityProps</a>
- *Default:* No instrumented service observability alarms are created

The properties for a service that has implemented its own instrumentation to emit availability and latency metrics.

This will create alarms based
on those metrics to determine single AZ impact. Specify either this or
basicServiceObservabilityProps, but not both.

---

### OperationMetricDetailsProps <a name="OperationMetricDetailsProps" id="multi-az-observability.OperationMetricDetailsProps"></a>

The properties for operation metric details.

#### Initializer <a name="Initializer" id="multi-az-observability.OperationMetricDetailsProps.Initializer"></a>

```typescript
import { OperationMetricDetailsProps } from 'multi-az-observability'

const operationMetricDetailsProps: OperationMetricDetailsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.metricDimensions">metricDimensions</a></code> | <code><a href="#multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The user implemented functions for providing the metric's dimensions. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#multi-az-observability.OperationMetricDetailsProps.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="multi-az-observability.OperationMetricDetailsProps.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="multi-az-observability.OperationMetricDetailsProps.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="multi-az-observability.OperationMetricDetailsProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="multi-az-observability.OperationMetricDetailsProps.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="multi-az-observability.OperationMetricDetailsProps.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="multi-az-observability.OperationMetricDetailsProps.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#multi-az-observability.MetricDimensions">MetricDimensions</a>

The user implemented functions for providing the metric's dimensions.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="multi-az-observability.OperationMetricDetailsProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.OperationMetricDetailsProps.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.OperationMetricDetailsProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="multi-az-observability.OperationMetricDetailsProps.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="multi-az-observability.OperationMetricDetailsProps.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="multi-az-observability.OperationMetricDetailsProps.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="multi-az-observability.OperationMetricDetailsProps.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="multi-az-observability.OperationMetricDetailsProps.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

### OperationProps <a name="OperationProps" id="multi-az-observability.OperationProps"></a>

Properties for an operation.

#### Initializer <a name="Initializer" id="multi-az-observability.OperationProps.Initializer"></a>

```typescript
import { OperationProps } from 'multi-az-observability'

const operationProps: OperationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.OperationProps.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#multi-az-observability.OperationProps.property.isCritical">isCritical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#multi-az-observability.OperationProps.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#multi-az-observability.OperationProps.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#multi-az-observability.OperationProps.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#multi-az-observability.OperationProps.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#multi-az-observability.OperationProps.property.service">service</a></code> | <code><a href="#multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#multi-az-observability.OperationProps.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has a canary. |
| <code><a href="#multi-az-observability.OperationProps.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If you define this property, a synthetic canary will be provisioned to test the operation. |
| <code><a href="#multi-az-observability.OperationProps.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="multi-az-observability.OperationProps.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `isCritical`<sup>Required</sup> <a name="isCritical" id="multi-az-observability.OperationProps.property.isCritical"></a>

```typescript
public readonly isCritical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.OperationProps.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="multi-az-observability.OperationProps.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="multi-az-observability.OperationProps.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="multi-az-observability.OperationProps.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="multi-az-observability.OperationProps.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="multi-az-observability.OperationProps.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>
- *Default:* No alarms, rules, or dashboards will be created from canary metrics

Optional metric details if the service has a canary.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="multi-az-observability.OperationProps.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>
- *Default:* No canary will be created for this operation

If you define this property, a synthetic canary will be provisioned to test the operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="multi-az-observability.OperationProps.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No Contributor Insight rules will be created and the number of instances contributing to AZ faults or high latency will not be considered, so a single bad instance could make the AZ appear to look impaired.

The server side details for contributor insights rules.

---

### ServiceProps <a name="ServiceProps" id="multi-az-observability.ServiceProps"></a>

Properties to initialize a service.

#### Initializer <a name="Initializer" id="multi-az-observability.ServiceProps.Initializer"></a>

```typescript
import { ServiceProps } from 'multi-az-observability'

const serviceProps: ServiceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.ServiceProps.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#multi-az-observability.ServiceProps.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#multi-az-observability.ServiceProps.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#multi-az-observability.ServiceProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#multi-az-observability.ServiceProps.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.ServiceProps.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="multi-az-observability.ServiceProps.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="multi-az-observability.ServiceProps.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.ServiceProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="multi-az-observability.ServiceProps.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---

## Classes <a name="Classes" id="Classes"></a>

### CanaryMetrics <a name="CanaryMetrics" id="multi-az-observability.CanaryMetrics"></a>

- *Implements:* <a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Represents metrics for a canary testing a service.

#### Initializers <a name="Initializers" id="multi-az-observability.CanaryMetrics.Initializer"></a>

```typescript
import { CanaryMetrics } from 'multi-az-observability'

new CanaryMetrics(props: CanaryMetricProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.CanaryMetrics.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.CanaryMetricProps">CanaryMetricProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="multi-az-observability.CanaryMetrics.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.CanaryMetricProps">CanaryMetricProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.CanaryMetrics.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#multi-az-observability.CanaryMetrics.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |
| <code><a href="#multi-az-observability.CanaryMetrics.property.canaryContributorInsightRuleDetails">canaryContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The canary details for contributor insights rules. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="multi-az-observability.CanaryMetrics.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="multi-az-observability.CanaryMetrics.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---

##### `canaryContributorInsightRuleDetails`<sup>Optional</sup> <a name="canaryContributorInsightRuleDetails" id="multi-az-observability.CanaryMetrics.property.canaryContributorInsightRuleDetails"></a>

```typescript
public readonly canaryContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No contributor insights rules will be created for the canary metrics

The canary details for contributor insights rules.

---


### ContributorInsightRuleDetails <a name="ContributorInsightRuleDetails" id="multi-az-observability.ContributorInsightRuleDetails"></a>

- *Implements:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The contributor insight rule details for creating an insight rule.

#### Initializers <a name="Initializers" id="multi-az-observability.ContributorInsightRuleDetails.Initializer"></a>

```typescript
import { ContributorInsightRuleDetails } from 'multi-az-observability'

new ContributorInsightRuleDetails(props: ContributorInsightRuleDetailsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.ContributorInsightRuleDetailsProps">ContributorInsightRuleDetailsProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="multi-az-observability.ContributorInsightRuleDetails.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.ContributorInsightRuleDetailsProps">ContributorInsightRuleDetailsProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#multi-az-observability.ContributorInsightRuleDetails.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="multi-az-observability.ContributorInsightRuleDetails.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="multi-az-observability.ContributorInsightRuleDetails.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="multi-az-observability.ContributorInsightRuleDetails.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="multi-az-observability.ContributorInsightRuleDetails.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="multi-az-observability.ContributorInsightRuleDetails.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="multi-az-observability.ContributorInsightRuleDetails.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---


### MetricDimensions <a name="MetricDimensions" id="multi-az-observability.MetricDimensions"></a>

#### Initializers <a name="Initializers" id="multi-az-observability.MetricDimensions.Initializer"></a>

```typescript
import { MetricDimensions } from 'multi-az-observability'

new MetricDimensions(staticDimensions: {[ key: string ]: string}, availabilityZoneIdKey: string, regionKey?: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.MetricDimensions.Initializer.parameter.staticDimensions">staticDimensions</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#multi-az-observability.MetricDimensions.Initializer.parameter.availabilityZoneIdKey">availabilityZoneIdKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#multi-az-observability.MetricDimensions.Initializer.parameter.regionKey">regionKey</a></code> | <code>string</code> | *No description.* |

---

##### `staticDimensions`<sup>Required</sup> <a name="staticDimensions" id="multi-az-observability.MetricDimensions.Initializer.parameter.staticDimensions"></a>

- *Type:* {[ key: string ]: string}

---

##### `availabilityZoneIdKey`<sup>Required</sup> <a name="availabilityZoneIdKey" id="multi-az-observability.MetricDimensions.Initializer.parameter.availabilityZoneIdKey"></a>

- *Type:* string

---

##### `regionKey`<sup>Optional</sup> <a name="regionKey" id="multi-az-observability.MetricDimensions.Initializer.parameter.regionKey"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.MetricDimensions.regionalDimensions">regionalDimensions</a></code> | *No description.* |
| <code><a href="#multi-az-observability.MetricDimensions.zonalDimensions">zonalDimensions</a></code> | *No description.* |

---

##### `regionalDimensions` <a name="regionalDimensions" id="multi-az-observability.MetricDimensions.regionalDimensions"></a>

```typescript
public regionalDimensions(region: string): {[ key: string ]: string}
```

###### `region`<sup>Required</sup> <a name="region" id="multi-az-observability.MetricDimensions.regionalDimensions.parameter.region"></a>

- *Type:* string

---

##### `zonalDimensions` <a name="zonalDimensions" id="multi-az-observability.MetricDimensions.zonalDimensions"></a>

```typescript
public zonalDimensions(availabilityZoneId: string, region: string): {[ key: string ]: string}
```

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="multi-az-observability.MetricDimensions.zonalDimensions.parameter.availabilityZoneId"></a>

- *Type:* string

---

###### `region`<sup>Required</sup> <a name="region" id="multi-az-observability.MetricDimensions.zonalDimensions.parameter.region"></a>

- *Type:* string

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.MetricDimensions.property.availabilityZoneIdKey">availabilityZoneIdKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#multi-az-observability.MetricDimensions.property.staticDimensions">staticDimensions</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#multi-az-observability.MetricDimensions.property.regionKey">regionKey</a></code> | <code>string</code> | *No description.* |

---

##### `availabilityZoneIdKey`<sup>Required</sup> <a name="availabilityZoneIdKey" id="multi-az-observability.MetricDimensions.property.availabilityZoneIdKey"></a>

```typescript
public readonly availabilityZoneIdKey: string;
```

- *Type:* string

---

##### `staticDimensions`<sup>Required</sup> <a name="staticDimensions" id="multi-az-observability.MetricDimensions.property.staticDimensions"></a>

```typescript
public readonly staticDimensions: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `regionKey`<sup>Optional</sup> <a name="regionKey" id="multi-az-observability.MetricDimensions.property.regionKey"></a>

```typescript
public readonly regionKey: string;
```

- *Type:* string

---


### Operation <a name="Operation" id="multi-az-observability.Operation"></a>

- *Implements:* <a href="#multi-az-observability.IOperation">IOperation</a>

A single operation that is part of a service.

#### Initializers <a name="Initializers" id="multi-az-observability.Operation.Initializer"></a>

```typescript
import { Operation } from 'multi-az-observability'

new Operation(props: OperationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.Operation.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.OperationProps">OperationProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="multi-az-observability.Operation.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.OperationProps">OperationProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.Operation.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#multi-az-observability.Operation.property.isCritical">isCritical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#multi-az-observability.Operation.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#multi-az-observability.Operation.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#multi-az-observability.Operation.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#multi-az-observability.Operation.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#multi-az-observability.Operation.property.service">service</a></code> | <code><a href="#multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#multi-az-observability.Operation.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has a canary. |
| <code><a href="#multi-az-observability.Operation.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If they have been added, the properties for creating new canary tests on this operation. |
| <code><a href="#multi-az-observability.Operation.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="multi-az-observability.Operation.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `isCritical`<sup>Required</sup> <a name="isCritical" id="multi-az-observability.Operation.property.isCritical"></a>

```typescript
public readonly isCritical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.Operation.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="multi-az-observability.Operation.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="multi-az-observability.Operation.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="multi-az-observability.Operation.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="multi-az-observability.Operation.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="multi-az-observability.Operation.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Optional metric details if the service has a canary.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="multi-az-observability.Operation.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>

If they have been added, the properties for creating new canary tests on this operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="multi-az-observability.Operation.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The server side details for contributor insights rules.

---


### OperationMetricDetails <a name="OperationMetricDetails" id="multi-az-observability.OperationMetricDetails"></a>

- *Implements:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

Generic metric details for an operation.

#### Initializers <a name="Initializers" id="multi-az-observability.OperationMetricDetails.Initializer"></a>

```typescript
import { OperationMetricDetails } from 'multi-az-observability'

new OperationMetricDetails(props: OperationMetricDetailsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.OperationMetricDetails.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.OperationMetricDetailsProps">OperationMetricDetailsProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="multi-az-observability.OperationMetricDetails.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.OperationMetricDetailsProps">OperationMetricDetailsProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.metricDimensions">metricDimensions</a></code> | <code><a href="#multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The metric dimensions for this operation, must be implemented as a concrete class by the user. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#multi-az-observability.OperationMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="multi-az-observability.OperationMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="multi-az-observability.OperationMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="multi-az-observability.OperationMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="multi-az-observability.OperationMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="multi-az-observability.OperationMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="multi-az-observability.OperationMetricDetails.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#multi-az-observability.MetricDimensions">MetricDimensions</a>

The metric dimensions for this operation, must be implemented as a concrete class by the user.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="multi-az-observability.OperationMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.OperationMetricDetails.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.OperationMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="multi-az-observability.OperationMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="multi-az-observability.OperationMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="multi-az-observability.OperationMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="multi-az-observability.OperationMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="multi-az-observability.OperationMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---


### Service <a name="Service" id="multi-az-observability.Service"></a>

- *Implements:* <a href="#multi-az-observability.IService">IService</a>

The representation of a service composed of multiple operations.

#### Initializers <a name="Initializers" id="multi-az-observability.Service.Initializer"></a>

```typescript
import { Service } from 'multi-az-observability'

new Service(props: ServiceProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.Service.Initializer.parameter.props">props</a></code> | <code><a href="#multi-az-observability.ServiceProps">ServiceProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="multi-az-observability.Service.Initializer.parameter.props"></a>

- *Type:* <a href="#multi-az-observability.ServiceProps">ServiceProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.Service.addOperation">addOperation</a></code> | Adds an operation to this service and sets the operation's service property. |

---

##### `addOperation` <a name="addOperation" id="multi-az-observability.Service.addOperation"></a>

```typescript
public addOperation(operation: IOperation): IService
```

Adds an operation to this service and sets the operation's service property.

###### `operation`<sup>Required</sup> <a name="operation" id="multi-az-observability.Service.addOperation.parameter.operation"></a>

- *Type:* <a href="#multi-az-observability.IOperation">IOperation</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.Service.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#multi-az-observability.Service.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#multi-az-observability.Service.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#multi-az-observability.Service.property.operations">operations</a></code> | <code><a href="#multi-az-observability.IOperation">IOperation</a>[]</code> | The operations that are part of this service. |
| <code><a href="#multi-az-observability.Service.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#multi-az-observability.Service.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.Service.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="multi-az-observability.Service.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="multi-az-observability.Service.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `operations`<sup>Required</sup> <a name="operations" id="multi-az-observability.Service.property.operations"></a>

```typescript
public readonly operations: IOperation[];
```

- *Type:* <a href="#multi-az-observability.IOperation">IOperation</a>[]

The operations that are part of this service.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.Service.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="multi-az-observability.Service.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IAvailabilityZoneMapper <a name="IAvailabilityZoneMapper" id="multi-az-observability.IAvailabilityZoneMapper"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#multi-az-observability.AvailabilityZoneMapper">AvailabilityZoneMapper</a>, <a href="#multi-az-observability.IAvailabilityZoneMapper">IAvailabilityZoneMapper</a>

A wrapper for the Availability Zone mapper construct that allows you to translate Availability Zone names to Availability Zone Ids and vice a versa using the mapping in the AWS account where this is deployed.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsArray">allAvailabilityZoneIdsAsArray</a></code> | Returns a reference that can be cast to a string array with all of the Availability Zone Ids. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList">allAvailabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList">allAvailabilityZoneNamesAsCommaDelimitedList</a></code> | Gets all of the Availability Zone names in this Region as a comma delimited list. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId">availabilityZoneId</a></code> | Gets the Availability Zone Id for the given Availability Zone Name in this account. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter">availabilityZoneIdFromAvailabilityZoneLetter</a></code> | Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray">availabilityZoneIdsAsArray</a></code> | Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList">availabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName">availabilityZoneName</a></code> | Gets the Availability Zone Name for the given Availability Zone Id in this account. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds">regionPrefixForAvailabilityZoneIds</a></code> | Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1". |

---

##### `allAvailabilityZoneIdsAsArray` <a name="allAvailabilityZoneIdsAsArray" id="multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsArray"></a>

```typescript
public allAvailabilityZoneIdsAsArray(): Reference
```

Returns a reference that can be cast to a string array with all of the Availability Zone Ids.

##### `allAvailabilityZoneIdsAsCommaDelimitedList` <a name="allAvailabilityZoneIdsAsCommaDelimitedList" id="multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneIdsAsCommaDelimitedList(): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

##### `allAvailabilityZoneNamesAsCommaDelimitedList` <a name="allAvailabilityZoneNamesAsCommaDelimitedList" id="multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneNamesAsCommaDelimitedList(): string
```

Gets all of the Availability Zone names in this Region as a comma delimited list.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Name

##### `availabilityZoneId` <a name="availabilityZoneId" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId"></a>

```typescript
public availabilityZoneId(availabilityZoneName: string): string
```

Gets the Availability Zone Id for the given Availability Zone Name in this account.

###### `availabilityZoneName`<sup>Required</sup> <a name="availabilityZoneName" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId.parameter.availabilityZoneName"></a>

- *Type:* string

---

##### `availabilityZoneIdFromAvailabilityZoneLetter` <a name="availabilityZoneIdFromAvailabilityZoneLetter" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter"></a>

```typescript
public availabilityZoneIdFromAvailabilityZoneLetter(letter: string): string
```

Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account.

###### `letter`<sup>Required</sup> <a name="letter" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter.parameter.letter"></a>

- *Type:* string

---

##### `availabilityZoneIdsAsArray` <a name="availabilityZoneIdsAsArray" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray"></a>

```typescript
public availabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[]
```

Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided.

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneIdsAsCommaDelimitedList` <a name="availabilityZoneIdsAsCommaDelimitedList" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneName` <a name="availabilityZoneName" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName"></a>

```typescript
public availabilityZoneName(availabilityZoneId: string): string
```

Gets the Availability Zone Name for the given Availability Zone Id in this account.

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName.parameter.availabilityZoneId"></a>

- *Type:* string

---

##### `regionPrefixForAvailabilityZoneIds` <a name="regionPrefixForAvailabilityZoneIds" id="multi-az-observability.IAvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds"></a>

```typescript
public regionPrefixForAvailabilityZoneIds(): string
```

Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1".

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The function that does the mapping. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group for the function's logs. |
| <code><a href="#multi-az-observability.IAvailabilityZoneMapper.property.mapper">mapper</a></code> | <code>aws-cdk-lib.CustomResource</code> | The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids. |

---

##### `node`<sup>Required</sup> <a name="node" id="multi-az-observability.IAvailabilityZoneMapper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="multi-az-observability.IAvailabilityZoneMapper.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The function that does the mapping.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="multi-az-observability.IAvailabilityZoneMapper.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The log group for the function's logs.

---

##### `mapper`<sup>Required</sup> <a name="mapper" id="multi-az-observability.IAvailabilityZoneMapper.property.mapper"></a>

```typescript
public readonly mapper: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids.

---

### ICanaryMetrics <a name="ICanaryMetrics" id="multi-az-observability.ICanaryMetrics"></a>

- *Implemented By:* <a href="#multi-az-observability.CanaryMetrics">CanaryMetrics</a>, <a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

The metric definitions for metric produced by the canary.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.ICanaryMetrics.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#multi-az-observability.ICanaryMetrics.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |
| <code><a href="#multi-az-observability.ICanaryMetrics.property.canaryContributorInsightRuleDetails">canaryContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The canary details for contributor insights rules. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="multi-az-observability.ICanaryMetrics.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="multi-az-observability.ICanaryMetrics.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---

##### `canaryContributorInsightRuleDetails`<sup>Optional</sup> <a name="canaryContributorInsightRuleDetails" id="multi-az-observability.ICanaryMetrics.property.canaryContributorInsightRuleDetails"></a>

```typescript
public readonly canaryContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The canary details for contributor insights rules.

---

### IContributorInsightRuleDetails <a name="IContributorInsightRuleDetails" id="multi-az-observability.IContributorInsightRuleDetails"></a>

- *Implemented By:* <a href="#multi-az-observability.ContributorInsightRuleDetails">ContributorInsightRuleDetails</a>, <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

Details for setting up Contributor Insight rules.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#multi-az-observability.IContributorInsightRuleDetails.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="multi-az-observability.IContributorInsightRuleDetails.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="multi-az-observability.IContributorInsightRuleDetails.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="multi-az-observability.IContributorInsightRuleDetails.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="multi-az-observability.IContributorInsightRuleDetails.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="multi-az-observability.IContributorInsightRuleDetails.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="multi-az-observability.IContributorInsightRuleDetails.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---

### IMultiAvailabilityZoneObservability <a name="IMultiAvailabilityZoneObservability" id="multi-az-observability.IMultiAvailabilityZoneObservability"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#multi-az-observability.MultiAvailabilityZoneObservability">MultiAvailabilityZoneObservability</a>, <a href="#multi-az-observability.IMultiAvailabilityZoneObservability">IMultiAvailabilityZoneObservability</a>

Represents the components of the multi-AZ observability construct.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IMultiAvailabilityZoneObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="multi-az-observability.IMultiAvailabilityZoneObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

### IOperation <a name="IOperation" id="multi-az-observability.IOperation"></a>

- *Implemented By:* <a href="#multi-az-observability.Operation">Operation</a>, <a href="#multi-az-observability.IOperation">IOperation</a>

Represents an operation in a service.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IOperation.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#multi-az-observability.IOperation.property.isCritical">isCritical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#multi-az-observability.IOperation.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#multi-az-observability.IOperation.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#multi-az-observability.IOperation.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#multi-az-observability.IOperation.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#multi-az-observability.IOperation.property.service">service</a></code> | <code><a href="#multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#multi-az-observability.IOperation.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has a canary. |
| <code><a href="#multi-az-observability.IOperation.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If they have been added, the properties for creating new canary tests on this operation. |
| <code><a href="#multi-az-observability.IOperation.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="multi-az-observability.IOperation.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `isCritical`<sup>Required</sup> <a name="isCritical" id="multi-az-observability.IOperation.property.isCritical"></a>

```typescript
public readonly isCritical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.IOperation.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="multi-az-observability.IOperation.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="multi-az-observability.IOperation.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="multi-az-observability.IOperation.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="multi-az-observability.IOperation.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="multi-az-observability.IOperation.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Optional metric details if the service has a canary.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="multi-az-observability.IOperation.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>

If they have been added, the properties for creating new canary tests on this operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="multi-az-observability.IOperation.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The server side details for contributor insights rules.

---

### IOperationMetricDetails <a name="IOperationMetricDetails" id="multi-az-observability.IOperationMetricDetails"></a>

- *Implemented By:* <a href="#multi-az-observability.OperationMetricDetails">OperationMetricDetails</a>, <a href="#multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

Details for operation metrics in one perspective, such as server side latency.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.metricDimensions">metricDimensions</a></code> | <code><a href="#multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The metric dimensions for this operation, must be implemented as a concrete class by the user. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#multi-az-observability.IOperationMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="multi-az-observability.IOperationMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="multi-az-observability.IOperationMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="multi-az-observability.IOperationMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="multi-az-observability.IOperationMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="multi-az-observability.IOperationMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="multi-az-observability.IOperationMetricDetails.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#multi-az-observability.MetricDimensions">MetricDimensions</a>

The metric dimensions for this operation, must be implemented as a concrete class by the user.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="multi-az-observability.IOperationMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="multi-az-observability.IOperationMetricDetails.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.IOperationMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="multi-az-observability.IOperationMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="multi-az-observability.IOperationMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="multi-az-observability.IOperationMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="multi-az-observability.IOperationMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="multi-az-observability.IOperationMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

### IService <a name="IService" id="multi-az-observability.IService"></a>

- *Implemented By:* <a href="#multi-az-observability.Service">Service</a>, <a href="#multi-az-observability.IService">IService</a>

Represents a complete service composed of one or more operations.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.IService.addOperation">addOperation</a></code> | Adds an operation to this service and sets the operation's service property. |

---

##### `addOperation` <a name="addOperation" id="multi-az-observability.IService.addOperation"></a>

```typescript
public addOperation(operation: IOperation): IService
```

Adds an operation to this service and sets the operation's service property.

###### `operation`<sup>Required</sup> <a name="operation" id="multi-az-observability.IService.addOperation.parameter.operation"></a>

- *Type:* <a href="#multi-az-observability.IOperation">IOperation</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#multi-az-observability.IService.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#multi-az-observability.IService.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#multi-az-observability.IService.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#multi-az-observability.IService.property.operations">operations</a></code> | <code><a href="#multi-az-observability.IOperation">IOperation</a>[]</code> | The operations that are part of this service. |
| <code><a href="#multi-az-observability.IService.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#multi-az-observability.IService.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="multi-az-observability.IService.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="multi-az-observability.IService.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="multi-az-observability.IService.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `operations`<sup>Required</sup> <a name="operations" id="multi-az-observability.IService.property.operations"></a>

```typescript
public readonly operations: IOperation[];
```

- *Type:* <a href="#multi-az-observability.IOperation">IOperation</a>[]

The operations that are part of this service.

---

##### `period`<sup>Required</sup> <a name="period" id="multi-az-observability.IService.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="multi-az-observability.IService.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---

## Enums <a name="Enums" id="Enums"></a>

### OutlierDetectionAlgorithm <a name="OutlierDetectionAlgorithm" id="multi-az-observability.OutlierDetectionAlgorithm"></a>

Available algorithms for performing outlier detection, currently only STATIC is supported.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#multi-az-observability.OutlierDetectionAlgorithm.STATIC">STATIC</a></code> | Defines using a static value to compare skew in faults or high latency responses. |
| <code><a href="#multi-az-observability.OutlierDetectionAlgorithm.CHI_SQUARED">CHI_SQUARED</a></code> | Uses the chi squared statistic to determine if there is a statistically significant skew in fault rate or high latency distribution. |
| <code><a href="#multi-az-observability.OutlierDetectionAlgorithm.Z_SCORE">Z_SCORE</a></code> | Uses z-score to determine if the skew in faults or high latency respones exceeds a defined number of standard devations (typically 3). |

---

##### `STATIC` <a name="STATIC" id="multi-az-observability.OutlierDetectionAlgorithm.STATIC"></a>

Defines using a static value to compare skew in faults or high latency responses.

---


##### `CHI_SQUARED` <a name="CHI_SQUARED" id="multi-az-observability.OutlierDetectionAlgorithm.CHI_SQUARED"></a>

Uses the chi squared statistic to determine if there is a statistically significant skew in fault rate or high latency distribution.

---


##### `Z_SCORE` <a name="Z_SCORE" id="multi-az-observability.OutlierDetectionAlgorithm.Z_SCORE"></a>

Uses z-score to determine if the skew in faults or high latency respones exceeds a defined number of standard devations (typically 3).

---

