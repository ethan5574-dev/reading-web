import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private s3Bucket: string;
  private s3Region: string;
  private s3Endpoint?: string;

  constructor(private configService: ConfigService) {
    this.s3Region = this.configService.get<string>('aws.region') || 'ap-southeast-1';
    this.s3Bucket = this.configService.get<string>('aws.s3Bucket') || '';
    this.s3Endpoint = this.configService.get<string>('aws.s3Endpoint');

    // Validate required environment variables
    if (!this.s3Bucket) {
      throw new Error('S3_BUCKET environment variable is required');
    }
    if (!this.configService.get<string>('aws.accessKeyId') || !this.configService.get<string>('aws.secretAccessKey')) {
      throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
    }

    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');

    this.s3Client = new S3Client({
      region: this.s3Region,
      endpoint: this.s3Endpoint,
      forcePathStyle: !!this.s3Endpoint,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
  }

  async uploadBuffer(params: {
    buffer: Buffer;
    key: string;
    contentType?: string;
    aclPublicRead?: boolean;
  }): Promise<{ key: string; url?: string }> {
    const { buffer, key, contentType, aclPublicRead } = params;
    const put = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // ACL removed - use bucket policy instead
    });
    await this.s3Client.send(put);
    return { key, url: aclPublicRead ? this.getPublicUrl(key) : undefined };
  }

  getPublicUrl(key: string): string | undefined {
    if (!this.s3Bucket) return undefined;
    if (this.s3Endpoint) {
      const base = this.s3Endpoint.replace(/\/$/, '');
      return `${base}/${this.s3Bucket}/${encodeURI(key)}`;
    }
    return `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${encodeURI(key)}`;
  }

  async getPresignedPutUrl(params: {
    key: string;
    contentType?: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: params.key,
      ContentType: params.contentType,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: params.expiresInSeconds ?? 300 });
    return url;
  }
}
