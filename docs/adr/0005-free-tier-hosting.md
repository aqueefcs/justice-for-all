# ADR 0005: Free-tier hosting

**Status:** Partly superseded by [ADR 0006](0006-aws-hosting.md) (API hosting moved from Google Cloud Run to AWS Lambda) · 2026-11-06

## Decision
| Need | Service | Upgrade trigger |
|---|---|---|
| API | ~~Google Cloud Run~~ → **AWS Lambda ap-south-1** (see ADR 0006) | see ADR 0006 |
| Database | MongoDB Atlas M0 on AWS Mumbai | >512 MB or >100 ops/s → Flex/M10 |
| Files & packs | Cloudflare R2 (10 GB, zero egress) | >10 GB |
| Admin & web hosting | Cloudflare Pages (commercial use allowed, unlike Vercel Hobby) | — |
| Edge | Cloudflare DNS/CDN/WAF | — |
| APK distribution | EAS Build internal distribution + EAS Update; `--local` builds when over quota | Build volume → EAS Starter |
| Monitoring | Sentry, PostHog, UptimeRobot, CloudWatch | Free limits |
| CI | GitHub Actions | — |

The only expected early costs are SMS OTP (Phase 2) and payment/video per-use fees (Phase 3).
