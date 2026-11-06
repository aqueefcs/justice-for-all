import { join } from 'node:path';
import { Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import type { Construct } from 'constructs';
import { ssmPath, type StageConfig } from './config';

const WORKER_BUNDLE = join(__dirname, '..', '..', 'apps', 'api', '.lambda', 'worker');

/**
 * SQS "jobs" queue (+ DLQ) and the worker Lambda that processes it.
 * Jobs: content.publishPacks, document.scan (Phase 2), email.send, consultation.remind (Phase 3).
 * All within the always-free tier (SQS 1M requests/month, Lambda 1M requests/month).
 */
export class JobsStack extends Stack {
  readonly queue: sqs.Queue;
  readonly dlqAlarm: cloudwatch.Alarm;

  constructor(scope: Construct, id: string, cfg: StageConfig, props?: StackProps) {
    super(scope, id, props);

    const dlq = new sqs.Queue(this, 'JobsDlq', {
      retentionPeriod: Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
    });
    this.queue = new sqs.Queue(this, 'JobsQueue', {
      visibilityTimeout: Duration.minutes(6), // > worker timeout
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
      deadLetterQueue: { queue: dlq, maxReceiveCount: 3 },
    });

    const worker = new lambda.Function(this, 'Worker', {
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.minutes(5),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(WORKER_BUNDLE),
      reservedConcurrentExecutions: undefined, // keep low with the API's Mongo pool in mind
      logGroup: new logs.LogGroup(this, 'WorkerLogs', { retention: cfg.logRetentionDays }),
      environment: {
        STAGE: cfg.stage,
        SSM_PARAMETER_PATH: ssmPath(cfg),
        NODE_OPTIONS: '--enable-source-maps',
        LOG_LEVEL: 'log',
        JOBS_QUEUE_URL: '', // the worker itself never enqueues to its own queue inline
        ...(cfg.contentCdnUrl ? { CONTENT_CDN_URL: cfg.contentCdnUrl } : {}),
      },
    });
    worker.addEventSource(new SqsEventSource(this.queue, { batchSize: 5, reportBatchItemFailures: true }));
    grantSsmRead(this, worker, cfg);

    this.dlqAlarm = new cloudwatch.Alarm(this, 'DlqNotEmpty', {
      metric: dlq.metricApproximateNumberOfMessagesVisible({ period: Duration.minutes(5) }),
      threshold: 0,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      alarmDescription: 'A background job failed 3 times and landed in the DLQ',
    });

    // TODO(Phase 2/3): EventBridge Scheduler rules (e.g. DPDP retention purge daily, consultation
    // reminders every 5 min) targeting a small "cron" Lambda. EventBridge Scheduler: 14M invocations/month free.
  }
}

export function grantSsmRead(stack: Stack, fn: lambda.IFunction, cfg: StageConfig) {
  fn.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ['ssm:GetParametersByPath'],
      resources: [`arn:aws:ssm:${stack.region}:${stack.account}:parameter${ssmPath(cfg)}`, `arn:aws:ssm:${stack.region}:${stack.account}:parameter${ssmPath(cfg)}/*`],
    }),
  );
  // SecureString with the AWS-managed key (alias/aws/ssm) is decrypted via SSM; no extra KMS grant needed.
}
