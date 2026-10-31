import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export type UploadSignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  type: string;
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log('Cloudinary signed URL generator initialized.');
    }
  }

  /**
   * Generates a cryptographic upload signature for server-signed direct uploads
   * enforcing type: 'authenticated' for private storage.
   */
  createUploadSignature(folder = 'attachments'): UploadSignatureResponse {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary environment credentials missing');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folderPath = `median/${folder}`;
    const type = 'authenticated';

    const paramsToSign = {
      timestamp,
      folder: folderPath,
      type,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: folderPath,
      type,
    };
  }

  /**
   * Generates a short-lived (1 hour) signed private URL for an authenticated asset.
   */
  getSignedUrl(
    publicIdOrUrl: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
    expiresInSeconds = 3600,
  ): string {
    if (!publicIdOrUrl) {
      throw new BadRequestException('publicId or URL is required');
    }

    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.startsWith('http')) {
      const parts = publicIdOrUrl.split('/upload/');
      if (parts.length > 1) {
        const afterUpload = parts[1];
        publicId = afterUpload.replace(/^v\d+\//, '');
      }
    }

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    try {
      const signedUrl = cloudinary.url(publicId, {
        type: 'authenticated',
        resource_type: resourceType,
        sign_url: true,
        secure: true,
        expires_at: expiresAt,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('Failed to generate Cloudinary signed URL', error);
      return publicIdOrUrl;
    }
  }
}
