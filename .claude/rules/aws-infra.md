---
paths:
  - "infra/**"
  - ".github/workflows/**"
---

# AWS infrastructure (CDK, TypeScript)

- All AWS resources are defined in `infra/` with AWS CDK. Never create or change resources by hand in the console, except account-level setup (MFA, Identity Center, Budgets).
- Region: `ap-south-1` (Mumbai) for everything that stores or processes user data.
- Stacks: `ApiStack` (Lambda + Function URL), `JobsStack` (SQS + DLQ + worker Lambdas + EventBridge Scheduler), `ObservabilityStack` (log retention, alarms, budgets). Stage names are `dev` and `prod`.
- Lambda defaults:
  - Node 22, `arm64`, 1024 MB, timeout 29 s for the API and up to 5 min for workers
  - esbuild bundling
  - Lambda Web Adapter layer
  - reserved concurrency set explicitly
  - log retention 14 days (dev) / 30 days (prod)
- IAM:
  - one role per function with least privilege (grant only the exact SSM parameter paths and queue ARNs)
  - no `*` resources
  - no `AdministratorAccess` outside bootstrap
- Secrets: SSM Parameter Store SecureString under `/jfa/<stage>/...`. Functions read them at cold start; never put secrets in environment variables in plain text or in CDK code.
- Every SQS queue has a DLQ (maxReceiveCount 3) and a CloudWatch alarm on DLQ depth > 0.
- Cost:
  - Stay within the always-free allowances. Don't add API Gateway, NAT Gateway, ALB, RDS, provisioned concurrency or VPC endpoints without an ADR, because they cost money from the first hour.
  - Keep the Budgets alerts in place.
- Tags on every resource: `project=justice-for-all`, `stage`, `owner`.
- CI runs `cdk synth` + `cdk diff` on PRs. `cdk deploy` runs only from `main` via the GitHub OIDC role.
