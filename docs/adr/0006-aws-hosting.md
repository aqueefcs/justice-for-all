# ADR 0006: AWS for backend hosting (supersedes the API-hosting part of ADR 0005)

**Status:** Accepted · 2026-11-06

## Context
The team wants AWS instead of Google Cloud. Requirements: free until real scale, India region, production-grade security, and a clear path to scale.

Since 15 July 2025, new AWS accounts get up to US$200 of credits on a 6-month "Free plan" and must then move to the "Paid plan". The **always-free** allowances continue on both plans:
- Lambda: 1M requests and 400k GB-seconds a month
- SQS: 1M requests a month
- CloudWatch: 5 GB of logs

EC2, Fargate and App Runner have no permanent free allowance.

## Decision
- **API:**
  - NestJS + Fastify on **AWS Lambda** in ap-south-1 (Node 22, arm64, 1024 MB)
  - runs unchanged through **AWS Lambda Web Adapter** and is exposed through a **Lambda Function URL**
  - fronted by **Cloudflare** (DNS, WAF, rate limiting) and locked to Cloudflare with a secret origin-verify header
  - no API Gateway
- **Async work:** **SQS** → worker Lambdas (content-pack publishing, ClamAV scans, SES email, Expo push). **EventBridge Scheduler** for cron jobs.
- **Secrets:** SSM Parameter Store SecureString. **Logs:** CloudWatch, with 14–30 day retention.
- **Email:** Amazon SES.
- **Infrastructure as code:** AWS CDK (TypeScript) in `/infra`. **CI:** GitHub Actions with OIDC (no static keys).
- **Unchanged:**
  - Cloudflare R2 for files and packs (zero egress, unlike S3)
  - Cloudflare Pages for the admin and web
  - MongoDB Atlas, deployed on AWS ap-south-1 to keep it in the same region as the Lambdas

## Consequences
- **Good:**
  - cost stays at about ₹0 at MVP scale
  - scales to zero and scales out automatically
  - Mumbai data residency
  - official, typed infrastructure as code
  - the same app can move to ECS Fargate later (Dockerfile kept)
- **Bad / mitigations:**
  - **Cold starts (~1 s):** content reads go through the CDN, not the API. Provisioned concurrency is available if needed.
  - **Connection pressure on Atlas M0** (500 connections): cache the connection per environment, `maxPoolSize` 2–5, cap reserved concurrency. New accounts may have a concurrency quota of 10, so request an increase before launch.
  - **Atlas `0.0.0.0/0` access list:** M0 has no PrivateLink, and a NAT Gateway for a fixed IP costs ~US$35+/month. Mitigated with strong SCRAM credentials over TLS and a least-privilege user. Upgrade path: M10 + PrivateLink, with the Lambdas in a VPC.
  - **No long-running work in a request:** everything slow goes through SQS. A request has a 15-minute hard limit, and API calls should finish in under 10 s.
  - **Billing risk:** AWS Budgets alerts at $1/$5/$10 from day one.
