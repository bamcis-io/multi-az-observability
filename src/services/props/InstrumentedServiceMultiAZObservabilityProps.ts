import { Duration } from 'aws-cdk-lib';
import { IService } from '../IService';

/**
 * The properties for adding alarms and dashboards
 * for an instrumented service.
 */
export interface InstrumentedServiceMultiAZObservabilityProps
{
  /**
     * The service that the alarms and dashboards are being crated for.
     */
  readonly service: IService;

  /**
     * Indicates whether to create per operation and overall service
     * dashboards.
     *
     * @default - No dashboards are created
     */
  readonly createDashboards?: boolean;

  /**
     * The threshold as a percentage between 0 and 1
     * on when to consider an AZ as an outlier for
     * faults or high latency responses
     */
  readonly outlierThreshold: number;

  /**
     * The interval used in the dashboard, defaults to
     * 60 minutes.
     *
     * @default - 60 minutes
     */
  readonly interval?: Duration;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket whose name
   * is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket location CDK provides by
   * default for bundled assets. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default - The assets will be uploaded to the default defined
   * asset location.
   */
  readonly assetsBucketParameterName?: string;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket that uses a prefix
   * that is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket prefix CDK provides by
   * default for bundled assets. This property only takes effect if you
   * defined the assetsBucketParameterName. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default - No object prefix will be added to your custom assets location.
   * However, if you have overridden something like the 'BucketPrefix' property
   * in your stack synthesizer with a variable like "${AssetsBucketPrefix",
   * you will need to define this property so it doesn't cause a reference error
   * even if the prefix value is blank.
   */
  readonly assetsBucketPrefixParameterName?: string;
}