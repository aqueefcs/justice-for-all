import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import type { StageConfig } from './config';

/**
 * Lets GitHub Actions deploy without long-lived AWS keys (OIDC).
 * Only workflows on `main` of the configured repo can assume the role, and the role may only
 * assume the CDK bootstrap roles (which do the actual deployment).
 * Deploy once manually: `pnpm --filter @jfa/infra cdk deploy JfaGithubOidc -c githubRepo=owner/repo`
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, cfg: StageConfig, props?: StackProps) {
    super(scope, id, props);
    if (!cfg.githubRepo) throw new Error('Set -c githubRepo=owner/repo');

    const provider = new iam.OpenIdConnectProvider(this, 'GithubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const role = new iam.Role(this, 'DeployRole', {
      roleName: 'jfa-github-deploy',
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
        StringLike: { 'token.actions.githubusercontent.com:sub': `repo:${cfg.githubRepo}:ref:refs/heads/main` },
      }),
    });
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
      }),
    );

    new CfnOutput(this, 'DeployRoleArn', { value: role.roleArn, description: 'Set as AWS_DEPLOY_ROLE_ARN in GitHub repo variables' });
  }
}
