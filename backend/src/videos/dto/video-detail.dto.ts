import { AccessLevel, ContentStatus, VideoPrimaryCategory, VideoLevel, VideoIntensity, VideoStrengthDemand } from '@prisma/client';

export class TagResponseDto {
  id: string;
  code: string;
  label: string;
  tagType: {
    code: string;
  };
}

export class VideoDetailDto {
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
}

export class VideoDetailResponseDto {
  data: VideoDetailDto;
}
