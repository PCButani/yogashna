import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ProgramTemplatesV1Service } from './program-templates-v1.service';
import { AccessLevel, ContentStatus } from '@prisma/client';
import { ProgramTemplateListResponseDto } from './dto/program-template-list.dto';
import { ProgramTemplateDetailDto, LibraryScheduleDto } from './dto/program-template-detail.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('programs')
export class ProgramTemplatesV1Controller {
  constructor(private readonly programTemplatesV1Service: ProgramTemplatesV1Service) {}

  @Get()
  async findAll(
    @Query('status') status?: ContentStatus,
    @Query('accessLevel') accessLevel?: AccessLevel,
  ): Promise<ProgramTemplateListResponseDto> {
    return this.programTemplatesV1Service.findAll(status, accessLevel);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProgramTemplateDetailDto> {
    return this.programTemplatesV1Service.findOne(id);
  }

  @Post(':id/library-schedule/regenerate')
  @UseGuards(FirebaseAuthGuard)
  async regenerateLibrarySchedule(@Param('id') id: string): Promise<LibraryScheduleDto> {
    return this.programTemplatesV1Service.regenerateLibrarySchedule(id);
  }
}
