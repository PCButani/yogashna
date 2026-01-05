import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AssetsService } from '../assets/assets.service';
import {
  VideoPrimaryCategory,
  VideoLevel,
  VideoIntensity,
  ContentStatus,
} from '@prisma/client';
import { VideoAssetDto, VideoAssetListResponseDto } from './dto/video-asset-list.dto';

@Injectable()
export class VideoAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async findAll(
    primaryCategory?: VideoPrimaryCategory,
    goal?: string,
    level?: VideoLevel,
    intensity?: VideoIntensity,
    minDurationSec?: number,
    maxDurationSec?: number,
    status?: ContentStatus,
    take: number = 50,
    skip: number = 0,
  ): Promise<VideoAssetListResponseDto> {
    // Build where clause
    const where: any = {};

    // Default to ACTIVE if not provided
    where.status = status || ContentStatus.ACTIVE;

    if (primaryCategory) {
      where.primaryCategory = primaryCategory;
    }

    if (level) {
      where.level = level;
    }

    if (intensity) {
      where.intensity = intensity;
    }

    if (minDurationSec !== undefined || maxDurationSec !== undefined) {
      where.durationSec = {};
      if (minDurationSec !== undefined) {
        where.durationSec.gte = minDurationSec;
      }
      if (maxDurationSec !== undefined) {
        where.durationSec.lte = maxDurationSec;
      }
    }

    // For goal filtering with JSON array contains
    // Prisma supports array_contains for PostgreSQL JSONB
    if (goal) {
      where.goals = {
        array_contains: goal,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.videoAsset.findMany({
        where,
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.videoAsset.count({ where }),
    ]);

    const dataWithUrls = await Promise.all(
      data.map(async (item) => ({
        ...item,
        thumbnailUrl: item.thumbnailKey
          ? await this.assetsService.getR2SignedUrl(item.thumbnailKey)
          : null,
        playbackUrl: item.streamUid
          ? await this.assetsService.getStreamPlaybackUrl(item.streamUid)
          : null,
      }))
    );

    return {
      data: dataWithUrls as VideoAssetDto[],
      total,
      take,
      skip,
    };
  }
}
