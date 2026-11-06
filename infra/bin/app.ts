import { App, Tags } from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { loadConfig, TAGS } from '../lib/config';
import { GithubOidcStack } from '../lib/github-oidc-stack';
import { JobsStack } from '../lib/jobs-stack';
import { ObservabilityStack } from '../lib/observability-stack';

/**
 * Usage (after `pnpm --filter @jfa/api bundle:lambda`):
 *   pnpm --filter @jfa/infra cdk bootstrap aws://<account>/ap-south-1
 *   pnpm --filter @jfa/infra cdk deploy --all -c stage=dev -c alertEmail=you@example.com
 */
const app = new App();
const cfg = loadConfig(app);
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: cfg.region };
const prefix = `Jfa-${cfg.stage}`;

const jobs = new JobsStack(app, `${prefix}-Jobs`, cfg, { env });
const api = new ApiStack(app, `${prefix}-Api`, cfg, { queue: jobs.queue }, { env });
new ObservabilityStack(app, `${prefix}-Observability`, cfg, { alarms: [api.errorsAlarm, jobs.dlqAlarm] }, { env });

if (cfg.githubRepo) new GithubOidcStack(app, 'JfaGithubOidc', cfg, { env });

for (const [k, v] of Object.entries(TAGS(cfg))) Tags.of(app).add(k, v);
