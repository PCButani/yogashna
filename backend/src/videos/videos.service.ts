import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {
    // Verify env vars on startup
    const r2BaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
    const streamSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;

    if (!r2BaseUrl || !streamSubdomain) {
      this.logger.error('❌ MISSING REQUIRED ENV VARS:');
      if (!r2BaseUrl) this.logger.error('   - CLOUDFLARE_R2_PUBLIC_BASE_URL');
      if (!streamSubdomain) this.logger.error('   - CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN');
      throw new Error('Missing required Cloudflare configuration');
    }

    this.logger.log('✅ Cloudflare configuration loaded');
  }

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

    // Map to DTOs with translations and generate URLs
    const data: VideoListItemDto[] = await Promise.all(
      videos.map(async (video) => {
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

        // Generate playable URLs
        const playbackUrl = video.cloudflareStreamUid
          ? await this.assetsService.getStreamPlaybackUrl(video.cloudflareStreamUid)
          : null;

        const thumbnailUrl = video.thumbnailR2Key
          ? await this.assetsService.getR2SignedUrl(video.thumbnailR2Key)
          : null;

        // Log first video for verification
        if (videos.indexOf(video) === 0) {
          this.logger.log(`🎬 Sample video URL generation:`);
          this.logger.log(`   - cloudflareStreamUid: ${video.cloudflareStreamUid}`);
          this.logger.log(`   - playbackUrl: ${playbackUrl}`);
          this.logger.log(`   - thumbnailR2Key: ${video.thumbnailR2Key}`);
          this.logger.log(`   - thumbnailUrl: ${thumbnailUrl}`);
        }

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
          playbackUrl,
          thumbnailUrl,
        };
      }),
    );

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

    // Generate playable URLs
    const playbackUrl = video.cloudflareStreamUid
      ? await this.assetsService.getStreamPlaybackUrl(video.cloudflareStreamUid)
      : null;

    const thumbnailUrl = video.thumbnailR2Key
      ? await this.assetsService.getR2SignedUrl(video.thumbnailR2Key)
      : null;

    this.logger.log(`🎬 Video detail URL generation for ${video.id}:`);
    this.logger.log(`   - playbackUrl: ${playbackUrl}`);
    this.logger.log(`   - thumbnailUrl: ${thumbnailUrl}`);

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
      playbackUrl,
      thumbnailUrl,
    };

    return { data };
  }
}
