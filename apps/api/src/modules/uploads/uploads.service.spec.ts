import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      CLOUDINARY_CLOUD_NAME: 'test_cloud',
      CLOUDINARY_API_KEY: '123456789',
      CLOUDINARY_API_SECRET: 'test_secret',
    });

    service = new UploadsService(configService);
  });

  describe('createUploadSignature', () => {
    it('should generate valid upload signature parameters for default folder', () => {
      const result = service.createUploadSignature();

      expect(result).toHaveProperty('signature');
      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBeGreaterThan(0);
      expect(result.apiKey).toBe('123456789');
      expect(result.cloudName).toBe('test_cloud');
      expect(result.folder).toBe('median/attachments');
      expect(result.type).toBe('authenticated');
      expect(typeof result.timestamp).toBe('number');
    });

    it('should generate upload signature for custom subfolder', () => {
      const result = service.createUploadSignature('cvs');

      expect(result.folder).toBe('median/cvs');
      expect(result.type).toBe('authenticated');
    });

    it('should throw BadRequestException if environment credentials are missing', () => {
      const emptyConfig = new ConfigService({});
      const unconfiguredService = new UploadsService(emptyConfig);

      expect(() => unconfiguredService.createUploadSignature('cvs')).toThrow(
        BadRequestException,
      );
      expect(() => unconfiguredService.createUploadSignature('cvs')).toThrow(
        'Cloudinary environment credentials missing',
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should throw BadRequestException if publicIdOrUrl is empty', () => {
      expect(() => service.getSignedUrl('')).toThrow(BadRequestException);
      expect(() => service.getSignedUrl('')).toThrow('publicId or URL is required');
    });

    it('should generate a signed Cloudinary URL for raw publicId', () => {
      const publicId = 'median/cvs/test_doc';
      const signedUrl = service.getSignedUrl(publicId);

      expect(typeof signedUrl).toBe('string');
      expect(signedUrl).toContain('test_cloud');
    });

    it('should strip full HTTP URL and version prefix to extract publicId before signing', () => {
      const fullUrl =
        'https://res.cloudinary.com/test_cloud/image/authenticated/s--hash--/v123456789/median/cvs/resume.pdf';
      const signedUrl = service.getSignedUrl(fullUrl);

      expect(typeof signedUrl).toBe('string');
      expect(signedUrl).toContain('median/cvs/resume.pdf');
    });
  });
});
