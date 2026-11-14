import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Upload } from 'livekit-server-sdk';

const PLAYBACK_LINK_SECONDS = 15 * 60;

type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secret: string;
};

/**
 * The S3-compatible bucket recordings are written to. LiveKit uploads each
 * file there directly; the API only hands out short-lived playback links
 * and deletes files once they are past retention.
 */
export class RecordingStorage {
  private readonly config: StorageConfig | null;
  private client: S3Client | null = null;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const config = {
      endpoint: env.RECORDINGS_S3_ENDPOINT ?? '',
      region: env.RECORDINGS_S3_REGION ?? '',
      bucket: env.RECORDINGS_S3_BUCKET ?? '',
      accessKey: env.RECORDINGS_S3_ACCESS_KEY ?? '',
      secret: env.RECORDINGS_S3_SECRET ?? '',
    };
    this.config = Object.values(config).every(Boolean) ? config : null;
  }

  get isConfigured() {
    return this.config !== null;
  }

  /** Where LiveKit should upload a recording */
  egressUpload() {
    const config = this.requireConfig();
    return new S3Upload({
      accessKey: config.accessKey,
      secret: config.secret,
      region: config.region,
      endpoint: config.endpoint,
      bucket: config.bucket,
      forcePathStyle: true,
    });
  }

  /** A link to watch the recording that stops working after 15 minutes */
  async playbackUrl(key: string) {
    const config = this.requireConfig();
    const url = await getSignedUrl(
      this.s3(),
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      { expiresIn: PLAYBACK_LINK_SECONDS },
    );
    return {
      url,
      expiresAt: new Date(Date.now() + PLAYBACK_LINK_SECONDS * 1000),
    };
  }

  async delete(key: string) {
    const config = this.requireConfig();
    await this.s3().send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
    );
  }

  private s3() {
    const config = this.requireConfig();
    this.client ??= new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secret,
      },
    });
    return this.client;
  }

  private requireConfig() {
    if (!this.config) {
      throw new Error(
        'Recording storage is not configured. Set the RECORDINGS_S3_* variables.',
      );
    }
    return this.config;
  }
}
