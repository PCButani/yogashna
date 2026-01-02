import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AccessLevel, ContentStatus, VideoPrimaryCategory } from '@prisma/client';
import {
  VideoListItemDto,
  VideoListResponseDto,
  TagResponseDto,
} from './dto/video-list.dto';
import {
  VideoDetailDto,
  VideoDetailResponseDto,
} from './dto/video-detail.dto';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    limit: number = 20,
    offset: number = 0,
    primaryCategory?: VideoPrimaryCategory,
    accessLevel?: AccessLevel,
    tagIds?: string[],
    status: ContentStatus = 'ACTIVE',
    lang: string = 'en',
  ): Promise<VideoListResponseDto> {
    // Build where clause
    const where: any = {
      status,
    };

    if (primaryCategory) {
      where.primaryCategory = primaryCategory;
    }

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
    const total = await this.prisma.video.count({ where });

    // Get videos with relations
    const videos = await this.prisma.video.findMany({
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
    const videoIds = videos.map((v) => v.id);
    const allTagIds = videos.flatMap((v) => v.tags.map((t) => t.tag.id));

    const translations = await this.prisma.entityTranslation.findMany({
      where: {
        languageCode: lang,
        OR: [
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

    // Map to DTOs with translations
    const data: VideoListItemDto[] = videos.map((video) => {
      const videoTranslations = translationMap.get(`video:${video.id}`);

      const tags: TagResponseDto[] = video.tags.map((videoTag) => {
        const tag = videoTag.tag;
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
  ): Promise<VideoDetailResponseDto> {
    // Build where clause
    const where: any = {
      id,
      status,
    };

    // Fetch video with relations
    const video = await this.prisma.video.findFirst({
      where,
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

    if (!video) {
      throw new NotFoundException(`Video with id ${id} not found or not ${status}`);
    }

    // Collect tag IDs that need translation
    const tagIds = video.tags.map((vt) => vt.tag.id);

    // Fetch all translations in one query
    const translations = await this.prisma.entityTranslation.findMany({
      where: {
        languageCode: lang,
        OR: [
          {
            entityType: 'video',
            entityId: video.id,
          },
          {
            entityType: 'tag',
            entityId: { in: tagIds },
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

    // Build tags
    const videoTranslations = translationMap.get(`video:${video.id}`);
    const tags: TagResponseDto[] = video.tags.map((vt) => {
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

    // Build final DTO
    const data: VideoDetailDto = {
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
      tags,
    };

    return { data };
  }
}
