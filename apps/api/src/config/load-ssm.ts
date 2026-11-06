import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';

/**
 * On AWS, secrets live in SSM Parameter Store (SecureString) under SSM_PARAMETER_PATH,
 * e.g. /jfa/dev/MONGODB_URI. CloudFormation cannot inject SecureStrings into Lambda env vars,
 * so we load them once at cold start, before Nest reads its config.
 * Locally (no SSM_PARAMETER_PATH) this is a no-op and `.env` is used.
 */
export async function loadSsmParameters(): Promise<void> {
  const path = process.env.SSM_PARAMETER_PATH;
  if (!path) return;
  const prefix = path.endsWith('/') ? path : `${path}/`;
  const client = new SSMClient({ region: process.env.AWS_REGION });
  let nextToken: string | undefined;
  do {
    const res = await client.send(
      new GetParametersByPathCommand({ Path: prefix, WithDecryption: true, Recursive: false, NextToken: nextToken }),
    );
    for (const p of res.Parameters ?? []) {
      const name = p.Name?.slice(prefix.length);
      // Explicit env vars (set by CDK) win over SSM values.
      if (name && p.Value !== undefined && process.env[name] === undefined) process.env[name] = p.Value;
    }
    nextToken = res.NextToken;
  } while (nextToken);
}
