import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AccessLevel, ContentStatus } from '@prisma/client';
import {
  ProgramTemplateListItemDto,
  ProgramTemplateListResponseDto,
  TagResponseDto,
} from './dto/program-template-list.dto';
import {
  ProgramTemplateDetailResponseDto,
  ProgramTemplateDetailDto,
  ProgramSectionDto,
  ProgramDayDto,
  ProgramDayItemDto,
  VideoDetailDto,
} from './dto/program-template-detail.dto';

@Injectable()
export class ProgramTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    limit: number = 20,
    offset: number = 0,
    accessLevel?: AccessLevel,
    tagIds?: string[],
    status: ContentStatus = 'ACTIVE',
    lang: string = 'en',
  ): Promise<ProgramTemplateListResponseDto> {
    // Build where clause
    const where: any = {
      status,
    };

    if (accessLevel) {
      where.accessLevel = accessLevel;
    }

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      };
    }

    // Get total count
    const total = await this.prisma.programTemplate.count({ where });

    // Get program templates with relations
    const programTemplates = await this.prisma.programTemplate.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: {
          include: {
            tag: {
              include: {
                tagType: true,
              },
            },
          },
        },
      },
    });

    // Fetch all translations in one query for efficiency
    const programIds = programTemplates.map((p) => p.id);
    const allTagIds = programTemplates.flatMap((p) => p.tags.map((t) => t.tag.id));

    const translations = await this.prisma.entityTranslation.findMany({
      where: {
        OR: [
          {
            entityType: 'program_template',
            entityId: { in: programIds },
            languageCode: lang,
          },
          {
            entityType: 'tag',
            entityId: { in: allTagIds },
            languageCode: lang,
          },
        ],
      },
    });

    // Create translation lookup map
    const translationMap = new Map<string, Map<string, string>>();
    translations.forEach((t) => {
      const key = `${t.entityType}:${t.entityId}`;
      if (!translationMap.has(key)) {
        translationMap.set(key, new Map());
      }
      translationMap.get(key)!.set(t.field, t.value);
    });

    // Map to DTOs with translations
    const data: ProgramTemplateListItemDto[] = programTemplates.map((pt) => {
      const ptTranslations = translationMap.get(`program_template:${pt.id}`);

      const tags: TagResponseDto[] = pt.tags.map((programTag) => {
        const tag = programTag.tag;
        const tagTranslations = translationMap.get(`tag:${tag.id}`);

        return {
          id: tag.id,
          code: tag.code,
          label: tagTranslations?.get('label') || tag.label,
          tagType: {
            code: tag.tagType.code,
          },
        };
      });

      return {
        id: pt.id,
        title: ptTranslations?.get('title') || pt.title,
        subtitle: ptTranslations?.get('subtitle') || pt.subtitle,
        descriptionShort: ptTranslations?.get('descriptionShort') || pt.descriptionShort,
        heroImageR2Key: pt.heroImageR2Key,
        defaultDays: pt.defaultDays,
        defaultMinutesPerDay: pt.defaultMinutesPerDay,
        levelLabel: pt.levelLabel,
        accessLevel: pt.accessLevel,
        requiredEntitlementKey: pt.requiredEntitlementKey,
        status: pt.status,
        version: pt.version,
        tags,
      };
    });

    return {
      data,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async findOne(
    id: string,
    status: ContentStatus = 'ACTIVE',
    lang: string = 'en',
  ): Promise<ProgramTemplateDetailResponseDto> {
    // Build where clause
    const where: any = {
      id,
      status,
    };

    // Fetch program template with all relations
    const programTemplate = await this.prisma.programTemplate.findFirst({
      where,
      include: {
        sections: {
          orderBy: [
            { type: 'asc' },
            { sortOrder: 'asc' },
          ],
        },
        days: {
          orderBy: {
            dayNumber: 'asc',
          },
          include: {
            items: {
              orderBy: {
                orderIndex: 'asc',
              },
              include: {
                video: {
                  include: {
                    tags: {
                      include: {
                        tag: {
                          include: {
                            tagType: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                tagType: true,
              },
            },
          },
        },
      },
    });

    if (!programTemplate) {
      throw new NotFoundException(`Program template with id ${id} not found or not ${status}`);
    }

    // Collect all entity IDs that need translation
    const videoIds = programTemplate.days.flatMap((day) =>
      day.items.map((item) => item.video.id)
    );
    const programTagIds = programTemplate.tags.map((pt) => pt.tag.id);
    const videoTagIds = programTemplate.days.flatMap((day) =>
      day.items.flatMap((item) => item.video.tags.map((vt) => vt.tag.id))
    );
    const allTagIds = [...new Set([...programTagIds, ...videoTagIds])];

    // Fetch all translations in one query
    const translations = await this.prisma.entityTranslation.findMany({
      where: {
        languageCode: lang,
        OR: [
          {
            entityType: 'program_template',
            entityId: programTemplate.id,
          },
          {
            entityType: 'video',
            entityId: { in: videoIds },
          },
          {
            entityType: 'tag',
            entityId: { in: allTagIds },
          },
        ],
      },
    });

    // Create translation lookup map
    const translationMap = new Map<string, Map<string, string>>();
    translations.forEach((t) => {
      const key = `${t.entityType}:${t.entityId}`;
      if (!translationMap.has(key)) {
        translationMap.set(key, new Map());
      }
      translationMap.get(key)!.set(t.field, t.value);
    });

    // Build sections (no translation needed, keep as stored)
    const sections: ProgramSectionDto[] = programTemplate.sections.map((section) => ({
      type: section.type,
      sortOrder: section.sortOrder,
      text: section.text,
    }));

    // Build days with items and videos
    const days: ProgramDayDto[] = programTemplate.days.map((day) => {
      const items: ProgramDayItemDto[] = day.items.map((item) => {
        const video = item.video;
        const videoTranslations = translationMap.get(`video:${video.id}`);

        // Build video tags
        const videoTags: TagResponseDto[] = video.tags.map((vt) => {
          const tag = vt.tag;
          const tagTranslations = translationMap.get(`tag:${tag.id}`);

          return {
            id: tag.id,
            code: tag.code,
            label: tagTranslations?.get('label') || tag.label,
            tagType: {
              code: tag.tagType.code,
            },
          };
        });

        const videoDetail: VideoDetailDto = {
          id: video.id,
          name: videoTranslations?.get('name') || video.name,
          descriptionShort: videoTranslations?.get('descriptionShort') || video.descriptionShort,
          primaryCategory: video.primaryCategory,
          durationSec: video.durationSec,
          level: video.level,
          intensity: video.intensity,
          strengthDemand: video.strengthDemand,
          accessLevel: video.accessLevel,
          requiredEntitlementKey: video.requiredEntitlementKey,
          cloudflareStreamUid: video.cloudflareStreamUid,
          thumbnailR2Key: video.thumbnailR2Key,
          status: video.status,
          version: video.version,
          tags: videoTags,
        };

        return {
          orderIndex: item.orderIndex,
          sequenceRole: item.sequenceRole,
          video: videoDetail,
        };
      });

      return {
        dayNumber: day.dayNumber,
        title: day.title,
        intent: day.intent,
        items,
      };
    });

    // Build program tags
    const ptTranslations = translationMap.get(`program_template:${programTemplate.id}`);
    const tags: TagResponseDto[] = programTemplate.tags.map((pt) => {
      const tag = pt.tag;
      const tagTranslations = translationMap.get(`tag:${tag.id}`);

      return {
        id: tag.id,
        code: tag.code,
        label: tagTranslations?.get('label') || tag.label,
        tagType: {
          code: tag.tagType.code,
        },
      };
    });

    // Build final DTO
    const data: ProgramTemplateDetailDto = {
      id: programTemplate.id,
      title: ptTranslations?.get('title') || programTemplate.title,
      subtitle: ptTranslations?.get('subtitle') || programTemplate.subtitle,
      descriptionShort: ptTranslations?.get('descriptionShort') || programTemplate.descriptionShort,
      heroImageR2Key: programTemplate.heroImageR2Key,
      defaultDays: programTemplate.defaultDays,
      defaultMinutesPerDay: programTemplate.defaultMinutesPerDay,
      levelLabel: programTemplate.levelLabel,
      accessLevel: programTemplate.accessLevel,
      requiredEntitlementKey: programTemplate.requiredEntitlementKey,
      status: programTemplate.status,
      version: programTemplate.version,
      sections,
      days,
      tags,
    };

    return { data };
  }
}
