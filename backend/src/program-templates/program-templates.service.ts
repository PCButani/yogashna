import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AccessLevel,
  ContentStatus,
  DayType,
  SequenceRole,
  VideoPrimaryCategory,
  YogaSubCategory,
} from '@prisma/client';
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
import { PlaylistSelectionService } from '../common/playlist/playlist-selection.service';
import { ProgramTemplateLibraryPlaylistPreviewDto } from './dto/program-template-library-playlist-preview.dto';

type LibraryCandidate = {
  id: string;
  sequenceRole: SequenceRole;
  durationSec: number;
  primaryCategory: VideoPrimaryCategory;
  yogaSubCategory: YogaSubCategory | null;
  createdAt: Date;
};

@Injectable()
export class ProgramTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playlistSelectionService: PlaylistSelectionService,
  ) {}

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
        heroImageKey: pt.heroImageKey,
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
      heroImageKey: programTemplate.heroImageKey,
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

  async previewLibraryPlaylist(
    programTemplateId: string,
    dayNumber: number,
  ): Promise<ProgramTemplateLibraryPlaylistPreviewDto> {
    const programTemplate = await this.prisma.programTemplate.findUnique({
      where: { id: programTemplateId },
      select: {
        id: true,
        defaultMinutesPerDay: true,
        libraryRhythm: true,
        recommendedLevel: true,
      },
    });

    if (!programTemplate) {
      throw new NotFoundException(`Program template with id ${programTemplateId} not found`);
    }

    const targetDurationSec = (programTemplate.defaultMinutesPerDay || 0) * 60;
    const dayType = this.resolveLibraryDayType(programTemplate.libraryRhythm, dayNumber);

    const candidates = await this.prisma.videoAsset.findMany({
      where: {
        status: ContentStatus.ACTIVE,
        primaryCategory: {
          in: [VideoPrimaryCategory.YOGA, VideoPrimaryCategory.BREATHING, VideoPrimaryCategory.MEDITATION],
        },
        ...(programTemplate.recommendedLevel
          ? { level: programTemplate.recommendedLevel }
          : {}),
      },
      select: {
        id: true,
        sequenceRole: true,
        durationSec: true,
        primaryCategory: true,
        yogaSubCategory: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const orderedCandidates = this.sortLibraryCandidates(candidates);
    const selection = this.generateLibrarySequence(
      orderedCandidates,
      targetDurationSec,
      dayNumber,
    );

    const playlistItems = selection.items.map((item, index) => ({
      videoAssetId: item.id,
      role: item.sequenceRole,
      durationSec: item.durationSec,
      order: index + 1,
    }));

    return {
      isPreview: true,
      mode: 'LIBRARY',
      dayNumber,
      dayType,
      targetDurationSec,
      totalDurationSec: selection.totalDurationSec,
      playlistItems,
    };
  }

  private generateLibrarySequence(
    candidates: LibraryCandidate[],
    targetDurationSec: number,
    dayNumber: number,
  ): { items: LibraryCandidate[]; totalDurationSec: number } {
    const history: string[][] = [];
    let lastSelection: { items: LibraryCandidate[]; totalDurationSec: number } = {
      items: [],
      totalDurationSec: 0,
    };

    for (let currentDay = 1; currentDay <= dayNumber; currentDay += 1) {
      const exclusion = new Set(history.flat());
      const available = candidates.filter((item) => !exclusion.has(item.id));
      lastSelection = this.selectLibraryItems(available, targetDurationSec);

      history.push(lastSelection.items.map((item) => item.id));
      if (history.length > 5) {
        history.shift();
      }
    }

    return lastSelection;
  }

  private selectLibraryItems(
    candidates: LibraryCandidate[],
    targetDurationSec: number,
  ): { items: LibraryCandidate[]; totalDurationSec: number } {
    const yogaCandidates = candidates.filter(
      (item) => item.primaryCategory === VideoPrimaryCategory.YOGA,
    );

    const forcedItems: LibraryCandidate[] = [];
    if (yogaCandidates.length > 0) {
      const warmup = candidates.find(
        (item) =>
          item.primaryCategory === VideoPrimaryCategory.YOGA &&
          item.yogaSubCategory === YogaSubCategory.WARM_UP,
      );
      const cooldown = candidates.find(
        (item) =>
          item.primaryCategory === VideoPrimaryCategory.YOGA &&
          item.yogaSubCategory === YogaSubCategory.COOL_DOWN,
      );

      if (warmup) {
        forcedItems.push(warmup);
      }
      if (cooldown && (!warmup || cooldown.id !== warmup.id)) {
        forcedItems.push(cooldown);
      }
    }

    const forcedIds = new Set(forcedItems.map((item) => item.id));
    const remainingCandidates = candidates.filter((item) => !forcedIds.has(item.id));
    const forcedDuration = forcedItems.reduce((sum, item) => sum + item.durationSec, 0);
    const remainingTarget = Math.max(0, targetDurationSec - forcedDuration);

    const selection = this.playlistSelectionService.selectByRole(
      remainingCandidates,
      remainingTarget,
    );

    const combinedItems = [...forcedItems, ...selection.items];
    const totalDurationSec = forcedDuration + selection.totalDurationSec;
    const orderedItems = this.sortLibraryItems(combinedItems, candidates);

    return {
      items: orderedItems,
      totalDurationSec,
    };
  }

  private sortLibraryCandidates(candidates: LibraryCandidate[]): LibraryCandidate[] {
    const ordered = [...candidates];
    ordered.sort((a, b) => {
      const bucketA = this.getLibraryBucket(a);
      const bucketB = this.getLibraryBucket(b);
      if (bucketA !== bucketB) {
        return bucketA - bucketB;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    return ordered;
  }

  private sortLibraryItems(
    items: LibraryCandidate[],
    orderedCandidates: LibraryCandidate[],
  ): LibraryCandidate[] {
    const roleOrder: Record<SequenceRole, number> = {
      MANDATORY: 0,
      ADJUSTABLE: 1,
      OPTIONAL: 2,
    };

    const orderMap = new Map<string, number>();
    orderedCandidates.forEach((candidate, index) => {
      orderMap.set(candidate.id, index);
    });

    return [...items].sort((a, b) => {
      const bucketA = this.getLibraryBucket(a);
      const bucketB = this.getLibraryBucket(b);
      if (bucketA !== bucketB) {
        return bucketA - bucketB;
      }
      const roleDiff = roleOrder[a.sequenceRole] - roleOrder[b.sequenceRole];
      if (roleDiff !== 0) {
        return roleDiff;
      }
      return (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0);
    });
  }

  private getLibraryBucket(candidate: LibraryCandidate): number {
    if (candidate.primaryCategory === VideoPrimaryCategory.YOGA) {
      if (candidate.yogaSubCategory === YogaSubCategory.WARM_UP) {
        return 1;
      }
      if (candidate.yogaSubCategory === YogaSubCategory.COOL_DOWN) {
        return 3;
      }
      return 2;
    }
    if (candidate.primaryCategory === VideoPrimaryCategory.BREATHING) {
      return 4;
    }
    if (candidate.primaryCategory === VideoPrimaryCategory.MEDITATION) {
      return 5;
    }
    return 6;
  }

  private resolveLibraryDayType(libraryRhythm: any, dayNumber: number): DayType {
    const rhythmDayType = this.resolveRhythmDayType(libraryRhythm, dayNumber);
    const dayType =
      rhythmDayType || (dayNumber % 7 === 0 ? DayType.RESTORE : DayType.GENTLE);
    return dayType === DayType.BUILD ? DayType.GENTLE : dayType;
  }

  private resolveRhythmDayType(libraryRhythm: any, dayNumber: number): DayType | null {
    if (!libraryRhythm || typeof libraryRhythm !== 'object') {
      return null;
    }

    const pattern = Array.isArray(libraryRhythm.pattern) ? libraryRhythm.pattern : null;
    const types = Array.isArray(libraryRhythm.types) ? libraryRhythm.types : null;

    if (!pattern || !types || pattern.length === 0 || pattern.length !== types.length) {
      return null;
    }

    const cycle: DayType[] = [];
    for (let i = 0; i < pattern.length; i += 1) {
      const count = Number(pattern[i]);
      const type = this.normalizeDayType(types[i]);
      if (!type || !Number.isFinite(count) || count <= 0) {
        return null;
      }
      for (let j = 0; j < Math.floor(count); j += 1) {
        cycle.push(type);
      }
    }

    if (cycle.length === 0) {
      return null;
    }

    return cycle[(dayNumber - 1) % cycle.length];
  }

  private normalizeDayType(value: unknown): DayType | null {
    if (typeof value !== 'string') {
      return null;
    }
    switch (value.trim().toLowerCase()) {
      case 'gentle':
        return DayType.GENTLE;
      case 'build':
        return DayType.BUILD;
      case 'restore':
        return DayType.RESTORE;
      default:
        return null;
    }
  }
}
