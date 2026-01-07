import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AbhyasaCycleService } from './abhyasa-cycle.service';
import {
  AbhyasaCycleSummaryDto,
  AbhyasaDayNotFoundDto,
  AbhyasaDayResponseDto,
} from './dto/abhyasa-cycle.dto';
import { AbhyasaPlaylistPreviewDto } from './dto/abhyasa-playlist-preview.dto';
import { AbhyasaPlaylistGenerateDto } from './dto/abhyasa-playlist-generate.dto';
import {
  AbhyasaPlaylistGenerateRangeRequestDto,
  AbhyasaPlaylistGenerateRangeResponseDto,
} from './dto/abhyasa-playlist-generate-range.dto';

@Controller('me/programs')
@UseGuards(FirebaseAuthGuard)
export class AbhyasaCycleController {
  constructor(private readonly abhyasaCycleService: AbhyasaCycleService) {}

  @Get(':programTemplateId/abhyasa-cycle')
  async getCycleSummary(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
  ): Promise<AbhyasaCycleSummaryDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.getCycleSummary(firebaseUid, programTemplateId);
  }

  @Get(':programTemplateId/abhyasa-cycle/days/:dayNumber')
  async getDay(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
    @Param('dayNumber') dayNumberStr: string,
  ): Promise<AbhyasaDayResponseDto | AbhyasaDayNotFoundDto> {
    const dayNumber = parseInt(dayNumberStr, 10);
    if (Number.isNaN(dayNumber) || dayNumber <= 0) {
      throw new BadRequestException('dayNumber must be a positive integer');
    }

    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.getDay(firebaseUid, programTemplateId, dayNumber);
  }

  @Get(':programTemplateId/abhyasa-cycle/today')
  async getToday(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
  ): Promise<AbhyasaDayResponseDto | AbhyasaDayNotFoundDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.getToday(firebaseUid, programTemplateId);
  }

  @Post(':programTemplateId/abhyasa-cycles/generate')
  async generateCycle(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
  ): Promise<AbhyasaCycleSummaryDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.generateCycle(firebaseUid, programTemplateId);
  }

  @Post(':programTemplateId/abhyasa-cycle/days/:dayNumber/playlist/preview')
  async previewPlaylist(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
    @Param('dayNumber') dayNumberStr: string,
  ): Promise<AbhyasaPlaylistPreviewDto> {
    const dayNumber = parseInt(dayNumberStr, 10);
    if (Number.isNaN(dayNumber) || dayNumber <= 0) {
      throw new BadRequestException('dayNumber must be a positive integer');
    }

    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.previewPlaylist(firebaseUid, programTemplateId, dayNumber);
  }

  @Post(':programTemplateId/abhyasa-cycle/days/:dayNumber/playlist/generate')
  async generatePlaylist(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
    @Param('dayNumber') dayNumberStr: string,
    @Query('regenerate') regenerateStr?: string,
  ): Promise<AbhyasaPlaylistGenerateDto | AbhyasaDayResponseDto> {
    const dayNumber = parseInt(dayNumberStr, 10);
    if (Number.isNaN(dayNumber) || dayNumber <= 0) {
      throw new BadRequestException('dayNumber must be a positive integer');
    }

    const regenerate = regenerateStr === 'true';
    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.generatePlaylist(
      firebaseUid,
      programTemplateId,
      dayNumber,
      regenerate,
    );
  }

  @Post(':programTemplateId/abhyasa-cycle/playlist/generate')
  async generatePlaylistRange(
    @Request() req: any,
    @Param('programTemplateId') programTemplateId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AbhyasaPlaylistGenerateRangeRequestDto,
  ): Promise<AbhyasaPlaylistGenerateRangeResponseDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.abhyasaCycleService.generatePlaylistRange(
      firebaseUid,
      programTemplateId,
      body,
    );
  }
}
