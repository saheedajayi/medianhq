import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('signature')
  getUploadSignature(@Query('folder') folder?: string) {
    const signatureData = this.uploadsService.createUploadSignature(folder);
    return {
      success: true,
      data: signatureData,
    };
  }

  @Get('signed-url')
  getSignedUrl(
    @Query('publicId') publicId: string,
    @Query('resourceType') resourceType?: 'image' | 'raw' | 'video' | 'auto',
  ) {
    if (!publicId) {
      throw new BadRequestException('publicId parameter is required');
    }

    const signedUrl = this.uploadsService.getSignedUrl(
      publicId,
      resourceType || 'auto',
    );

    return {
      success: true,
      signedUrl,
    };
  }
}
