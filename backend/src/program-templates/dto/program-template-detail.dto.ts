import { AccessLevel, ContentStatus, ProgramSectionType, VideoPrimaryCategory, VideoLevel, VideoIntensity, VideoStrengthDemand } from '@prisma/client';

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

export class ProgramDayItemDto {
  orderIndex: number;
  sequenceRole: string | null;
  video: VideoDetailDto;
}

export class ProgramDayDto {
  dayNumber: number;
  title: string | null;
  intent: string | null;
  items: ProgramDayItemDto[];
}

export class ProgramSectionDto {
  type: ProgramSectionType;
  sortOrder: number;
  text: string;
}

export class ProgramTemplateDetailDto {
  id: string;
  title: string;
  subtitle: string | null;
  descriptionShort: string | null;
  heroImageR2Key: string | null;
  defaultDays: number;
  defaultMinutesPerDay: number | null;
  levelLabel: string | null;
  accessLevel: AccessLevel;
  requiredEntitlementKey: string | null;
  status: ContentStatus;
  version: number;
  sections: ProgramSectionDto[];
  days: ProgramDayDto[];
  tags: TagResponseDto[];
}

export class ProgramTemplateDetailResponseDto {
  data: ProgramTemplateDetailDto;
}
