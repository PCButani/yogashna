import { Injectable } from '@nestjs/common';

@Injectable()
export class AssetsService {
  private readonly r2PublicBaseUrl: string;
  private readonly streamCustomerSubdomain: string;

  constructor() {
    // Using public base URL + customer subdomain as placeholder signing strategy.
    this.r2PublicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || '';
    this.streamCustomerSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN || '';
  }

  async getR2SignedUrl(key: string): Promise<string> {
    const base = this.r2PublicBaseUrl.replace(/\/+$/, '');
    const normalizedKey = key.replace(/^\/+/, '');
    return `${base}/${normalizedKey}`;
  }

  async getStreamPlaybackUrl(streamUid: string): Promise<string> {
    return `https://${this.streamCustomerSubdomain}.cloudflarestream.com/${streamUid}/manifest/video.m3u8`;
  }
}
