import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IntegrationStatus } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import { notConfigured, type Integration } from '../integration';

/**
 * Cloudflare R2 (S3-compatible). Two buckets:
 *  - public  (behind the CDN): content packs + manifest
 *  - private (signed URLs only): user uploads, lawyer drafts, verification docs
 * Not configured + local stage → public objects are written to `apps/api/.local-storage/`.
 */
@Injectable()
export class StorageService implements Integration {
  private readonly logger = new Logger(StorageService.name);
  private readonly client?: S3Client;

  constructor(private readonly config: AppConfig) {
    const accountId = config.get('R2_ACCOUNT_ID');
    const accessKeyId = config.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get('R2_SECRET_ACCESS_KEY');
    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  status(): IntegrationStatus {
    return { name: 'storage', provider: 'Cloudflare R2', configured: Boolean(this.client), phase: 'mvp' };
  }

  /** Upload to the public (CDN) bucket. Returns the public URL (or local path). */
  async putPublic(key: string, body: string | Uint8Array, contentType: string, cacheControl?: string) {
    const bucket = this.config.get('R2_PUBLIC_BUCKET');
    if (!this.client || !bucket) {
      if (!this.config.isLocal) notConfigured('storage');
      const path = join(process.cwd(), '.local-storage', key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, body);
      this.logger.warn(`R2 not configured — wrote ${key} to ${path}`);
      return { url: path };
    }
    await this.client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl }),
    );
    const cdn = this.config.get('CONTENT_CDN_URL');
    return { url: cdn ? `${cdn.replace(/\/$/, '')}/${key}` : key };
  }

  /** PHASE 2 — presigned PUT for private uploads (enforce type/size in the caller). */
  async presignPrivateUpload(key: string, contentType: string, expiresInSeconds = 300) {
    const bucket = this.config.get('R2_PRIVATE_BUCKET');
    if (!this.client || !bucket) notConfigured('storage');
    return getSignedUrl(this.client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
      expiresIn: expiresInSeconds,
    });
  }

  /** PHASE 2 — short-lived signed GET for private files. */
  async presignPrivateDownload(key: string, expiresInSeconds = 120) {
    const bucket = this.config.get('R2_PRIVATE_BUCKET');
    if (!this.client || !bucket) notConfigured('storage');
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }
}
