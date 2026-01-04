import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProgramTemplatesService } from './program-templates.service';
import { AccessLevel, ContentStatus } from '@prisma/client';
import { ProgramTemplateListResponseDto } from './dto/program-template-list.dto';
import { ProgramTemplateDetailResponseDto } from './dto/program-template-detail.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('program-templates')
@UseGuards(FirebaseAuthGuard)
export class ProgramTemplatesController {
  constructor(private readonly programTemplatesService: ProgramTemplatesService) {}

  @Get()
  async findAll(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('accessLevel') accessLevel?: AccessLevel,
    @Query('tagIds') tagIdsStr?: string,
    @Query('status') status?: ContentStatus,
    @Query('lang') lang?: string,
  ): Promise<ProgramTemplateListResponseDto> {
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

    return this.programTemplatesService.findAll(
      limit,
      offset,
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
  ): Promise<ProgramTemplateDetailResponseDto> {
    // Default status to ACTIVE if not provided
    const effectiveStatus = status || 'ACTIVE';

    // Default lang to 'en' if not provided
    const effectiveLang = lang || 'en';

    return this.programTemplatesService.findOne(id, effectiveStatus, effectiveLang);
  }
}
