import { Controller, Get, Query } from '@nestjs/common';
import { VideoAssetsService } from './video-assets.service';
import {
  VideoPrimaryCategory,
  VideoLevel,
  VideoIntensity,
  ContentStatus,
} from '@prisma/client';
import { VideoAssetListResponseDto } from './dto/video-asset-list.dto';

@Controller('video-assets')
export class VideoAssetsController {
  constructor(private readonly videoAssetsService: VideoAssetsService) {}

  @Get()
  async findAll(
    @Query('primaryCategory') primaryCategory?: VideoPrimaryCategory,
    @Query('goal') goal?: string,
    @Query('level') level?: VideoLevel,
    @Query('intensity') intensity?: VideoIntensity,
    @Query('minDurationSec') minDurationSecStr?: string,
    @Query('maxDurationSec') maxDurationSecStr?: string,
    @Query('status') status?: ContentStatus,
    @Query('take') takeStr?: string,
    @Query('skip') skipStr?: string,
  ): Promise<VideoAssetListResponseDto> {
    // Parse take
    let take = 50;
    if (takeStr) {
      const parsed = parseInt(takeStr, 10);
      if (!isNaN(parsed) && parsed > 0) {
        take = Math.min(parsed, 100); // Max 100
      }
    }

    // Parse skip
    let skip = 0;
    if (skipStr) {
      const parsed = parseInt(skipStr, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        skip = parsed;
      }
    }

    // Parse duration filters
    let minDurationSec: number | undefined;
    if (minDurationSecStr) {
      const parsed = parseInt(minDurationSecStr, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        minDurationSec = parsed;
      }
    }

    let maxDurationSec: number | undefined;
    if (maxDurationSecStr) {
      const parsed = parseInt(maxDurationSecStr, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        maxDurationSec = parsed;
      }
    }

    return this.videoAssetsService.findAll(
      primaryCategory,
      goal,
      level,
      intensity,
      minDurationSec,
      maxDurationSec,
      status,
      take,
      skip,
    );
  }
}
