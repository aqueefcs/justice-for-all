import { join } from 'node:path';
import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import type * as sqs from 'aws-cdk-lib/aws-sqs';
import type { Construct } from 'constructs';
import { ssmPath, type StageConfig } from './config';
import { grantSsmRead } from './jobs-stack';

const API_BUNDLE = join(__dirname, '..', '..', 'apps', 'api', '.lambda', 'api');

/**
 * NestJS API on Lambda via AWS Lambda Web Adapter, exposed by a Function URL (no API Gateway).
 * Cloudflare sits in front (DNS/WAF/rate limits) and adds `x-origin-verify`; the API rejects
 * requests without it, so the raw Function URL is useless to callers (ADR 0006).
 */
export class ApiStack extends Stack {
  readonly fn: lambda.Function;
  readonly errorsAlarm: cloudwatch.Alarm;

  constructor(scope: Construct, id: string, cfg: StageConfig, deps: { queue: sqs.IQueue }, props?: StackProps) {
    super(scope, id, props);

    const webAdapter = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'WebAdapter',
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerArm64:${cfg.webAdapterLayerVersion}`,
    );

    this.fn = new lambda.Function(this, 'Api', {
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.seconds(29),
      handler: 'run.sh',
      code: lambda.Code.fromAsset(API_BUNDLE),
      layers: [webAdapter],
      reservedConcurrentExecutions: cfg.apiReservedConcurrency,
      logGroup: new logs.LogGroup(this, 'ApiLogs', { retention: cfg.logRetentionDays }),
      environment: {
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
        AWS_LWA_PORT: '8080',
        AWS_LWA_READINESS_CHECK_PROTOCOL: 'tcp',
        PORT: '8080',
        NODE_OPTIONS: '--enable-source-maps',
        STAGE: cfg.stage,
        LOG_LEVEL: cfg.stage === 'prod' ? 'log' : 'debug',
        SWAGGER_ENABLED: cfg.stage === 'prod' ? 'false' : 'true',
        CORS_ORIGINS: cfg.corsOrigins,
        SSM_PARAMETER_PATH: ssmPath(cfg),
        JOBS_QUEUE_URL: deps.queue.queueUrl,
        ...(cfg.contentCdnUrl ? { CONTENT_CDN_URL: cfg.contentCdnUrl } : {}),
      },
    });
    deps.queue.grantSendMessages(this.fn);
    grantSsmRead(this, this.fn, cfg);

    const url = this.fn.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.NONE });

    this.errorsAlarm = new cloudwatch.Alarm(this, 'ApiErrors', {
      metric: this.fn.metricErrors({ period: Duration.minutes(5) }),
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'API Lambda errors (unhandled / timeouts)',
    });

    new CfnOutput(this, 'FunctionUrl', {
      value: url.url,
      description: 'Point a proxied Cloudflare DNS record (api.<domain>) at this host; add the x-origin-verify Transform Rule.',
    });
  }
}
