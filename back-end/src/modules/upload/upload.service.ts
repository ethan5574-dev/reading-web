import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from '../../common/s3.service';

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate unique key with timestamp and original name
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedName}`;

    try {
      const result = await this.s3Service.uploadBuffer({
        buffer: file.buffer,
        key,
        contentType: file.mimetype,
        aclPublicRead: true,
      });

      return {
        url: result.url || this.s3Service.getPublicUrl(key) || '',
        key: result.key,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'uploads',
    expiresInSeconds: number = 300,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedName}`;

    try {
      const uploadUrl = await this.s3Service.getPresignedPutUrl({
        key,
        contentType,
        expiresInSeconds,
      });

      const publicUrl = this.s3Service.getPublicUrl(key);

      return {
        uploadUrl,
        key,
        publicUrl: publicUrl || '',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }
}
