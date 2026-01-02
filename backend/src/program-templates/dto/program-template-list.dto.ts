import { AccessLevel, ContentStatus } from '@prisma/client';

export class ProgramTemplateListQueryDto {
  limit?: number;
  offset?: number;
  accessLevel?: AccessLevel;
  tagIds?: string;
  status?: ContentStatus;
  lang?: string;
}

export class TagResponseDto {
  id: string;
  code: string;
  label: string;
  tagType: {
    code: string;
  };
}

export class ProgramTemplateListItemDto {
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
  tags: TagResponseDto[];
}

export class PaginationDto {
  limit: number;
  offset: number;
  total: number;
}

export class ProgramTemplateListResponseDto {
  data: ProgramTemplateListItemDto[];
  pagination: PaginationDto;
}
