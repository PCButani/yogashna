import { AccessLevel, ContentStatus, VideoPrimaryCategory, VideoLevel, VideoIntensity, VideoStrengthDemand } from '@prisma/client';

export class TagResponseDto {
  id: string;
  code: string;
  label: string;
  tagType: {
    code: string;
  };
}

export class VideoListItemDto {
  id: string;
  name: string;
  descriptionShort: string | null;
  primaryCategory: VideoPrimaryCategory;
  durationSec: number;
  level: VideoLevel;
  intensity: VideoIntensity;
  strengthDemand: VideoStrengthDemand;
  accessLevel: AccessLevel;
  requiredEntitlementKey: string | null;
  cloudflareStreamUid: string | null;
  thumbnailR2Key: string | null;
  status: ContentStatus;
  version: number;
  tags: TagResponseDto[];

  // Generated URLs (not stored in DB)
  playbackUrl: string | null;
  thumbnailUrl: string | null;
}

export class PaginationDto {
  limit: number;
  offset: number;
  total: number;
}

export class VideoListResponseDto {
  data: VideoListItemDto[];
  pagination: PaginationDto;
}
