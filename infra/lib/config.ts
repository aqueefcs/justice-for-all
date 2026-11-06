import type { App } from 'aws-cdk-lib';

export type Stage = 'dev' | 'prod';

export interface StageConfig {
  stage: Stage;
  region: 'ap-south-1';
  /** Budget + alarm notifications. */
  alertEmail?: string;
  /** "owner/repo" for the GitHub OIDC deploy role. */
  githubRepo?: string;
  /**
   * AWS Lambda Web Adapter layer version (arm64).
   * TODO: confirm the latest version at https://github.com/awslabs/aws-lambda-web-adapter#lambda-functions-packaged-as-zip-package-for-aws-managed-runtimes
   */
  webAdapterLayerVersion: number;
  /**
   * Reserved concurrency for the API. Keeps (concurrency × MONGODB_MAX_POOL_SIZE) under Atlas M0's
   * 500 connections. New AWS accounts may have an account limit of 10 — leave undefined until the
   * quota increase is approved, then set e.g. 50.
   */
  apiReservedConcurrency?: number;
  logRetentionDays: 14 | 30;
  /** Non-secret runtime config. Secrets go in SSM under /jfa/<stage>/ (see docs/integrations.md). */
  corsOrigins: string;
  contentCdnUrl?: string;
}

export function loadConfig(app: App): StageConfig {
  const stage = (app.node.tryGetContext('stage') ?? 'dev') as Stage;
  if (stage !== 'dev' && stage !== 'prod') throw new Error(`Unknown stage "${stage}" (use -c stage=dev|prod)`);
  return {
    stage,
    region: 'ap-south-1',
    alertEmail: app.node.tryGetContext('alertEmail'),
    githubRepo: app.node.tryGetContext('githubRepo'),
    webAdapterLayerVersion: Number(app.node.tryGetContext('webAdapterLayerVersion') ?? 25),
    apiReservedConcurrency: app.node.tryGetContext('apiReservedConcurrency')
      ? Number(app.node.tryGetContext('apiReservedConcurrency'))
      : undefined,
    logRetentionDays: stage === 'prod' ? 30 : 14,
    corsOrigins: app.node.tryGetContext('corsOrigins') ?? '',
    contentCdnUrl: app.node.tryGetContext('contentCdnUrl'),
  };
}

export const TAGS = (cfg: StageConfig) => ({ project: 'justice-for-all', stage: cfg.stage, owner: 'jfa-tech' });
export const ssmPath = (cfg: StageConfig) => `/jfa/${cfg.stage}`;
