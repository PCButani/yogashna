import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly r2PublicBaseUrl: string;
  private readonly streamCustomerSubdomain: string;

  constructor() {
    // Using public base URL + customer subdomain as placeholder signing strategy.
    this.r2PublicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || '';
    this.streamCustomerSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN || '';

    // Log configuration on startup
    this.logger.log('✅ AssetsService initialized');
    this.logger.log(`   R2 Base URL: ${this.r2PublicBaseUrl}`);
    this.logger.log(`   Stream Subdomain: ${this.streamCustomerSubdomain}`);
    this.logger.log(`   Example thumbnail URL: ${this.r2PublicBaseUrl}/thumbnails/example.jpg`);
  }

  async getR2SignedUrl(key: string): Promise<string> {
    const base = this.r2PublicBaseUrl.replace(/\/+$/, '');
    const normalizedKey = key.replace(/^\/+/, '');
    const encodedKey = normalizedKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `${base}/${encodedKey}`;
  }

  async getStreamPlaybackUrl(streamUid: string): Promise<string> {
    // Use MP4 for better Android emulator compatibility during development
    // Production should use HLS (.m3u8) for adaptive streaming
    const useMp4 = process.env.NODE_ENV === 'development';

    if (useMp4) {
      this.logger.debug(`Generating MP4 URL for streamUid: ${streamUid}`);
      return `https://${this.streamCustomerSubdomain}.cloudflarestream.com/${streamUid}/downloads/default.mp4`;
    }

    return `https://${this.streamCustomerSubdomain}.cloudflarestream.com/${streamUid}/manifest/video.m3u8`;
  }
}
