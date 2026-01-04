import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { AccessLevel, ContentStatus, VideoPrimaryCategory } from '@prisma/client';
import { VideoListResponseDto } from './dto/video-list.dto';
import { VideoDetailResponseDto } from './dto/video-detail.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('videos')
@UseGuards(FirebaseAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async findAll(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('primaryCategory') primaryCategory?: VideoPrimaryCategory,
    @Query('accessLevel') accessLevel?: AccessLevel,
    @Query('tagIds') tagIdsStr?: string,
    @Query('status') status?: ContentStatus,
    @Query('lang') lang?: string,
  ): Promise<VideoListResponseDto> {
    // Parse and validate limit
    let limit = 20;
    if (limitStr) {
      const parsed = parseInt(limitStr, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50); // Max 50
      }
    }

    // Parse and validate offset
    let offset = 0;
    if (offsetStr) {
      const parsed = parseInt(offsetStr, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        offset = parsed;
      }
    }

    // Parse tagIds (comma-separated UUIDs)
    let tagIds: string[] | undefined;
    if (tagIdsStr && tagIdsStr.trim()) {
      tagIds = tagIdsStr.split(',').map((id) => id.trim()).filter((id) => id);
    }

    // Default status to ACTIVE if not provided
    const effectiveStatus = status || 'ACTIVE';

    // Default lang to 'en' if not provided
    const effectiveLang = lang || 'en';

    return this.videosService.findAll(
      limit,
      offset,
      primaryCategory,
      accessLevel,
      tagIds,
      effectiveStatus,
      effectiveLang,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('status') status?: ContentStatus,
    @Query('lang') lang?: string,
  ): Promise<VideoDetailResponseDto> {
    // Default status to ACTIVE if not provided
    const effectiveStatus = status || 'ACTIVE';

    // Default lang to 'en' if not provided
    const effectiveLang = lang || 'en';

    return this.videosService.findOne(id, effectiveStatus, effectiveLang);
  }
}
