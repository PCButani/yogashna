import { AccessLevel, ContentStatus, VideoLevel } from '@prisma/client';

export class ProgramTemplateListItemDto {
  id: string;
  title: string;
  subtitle: string | null;
  sanskritTitle: string | null;
  descriptionShort: string | null;
  heroImageKey: string;
  heroImageUrl: string | null;
  primaryGoal: string;
  focusArea: string;
  recommendedLevel: VideoLevel;
  defaultDays: number;
  defaultMinutesPerDay: number;
  benefits: any; // JSON array
  whatYouNeed: any | null; // JSON array
  safetyNotes: any | null; // JSON array
  accessLevel: AccessLevel;
  requiredEntitlementKey: string | null;
  status: ContentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramTemplateListResponseDto {
  data: ProgramTemplateListItemDto[];
  total: number;
}
