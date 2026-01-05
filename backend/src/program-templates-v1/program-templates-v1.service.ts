import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AccessLevel, ContentStatus } from '@prisma/client';
import { AssetsService } from '../assets/assets.service';
import {
  ProgramTemplateListItemDto,
  ProgramTemplateListResponseDto,
} from './dto/program-template-list.dto';
import {
  ProgramTemplateDetailDto,
  LibraryScheduleDto,
} from './dto/program-template-detail.dto';

@Injectable()
export class ProgramTemplatesV1Service {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async findAll(
    status?: ContentStatus,
    accessLevel?: AccessLevel,
  ): Promise<ProgramTemplateListResponseDto> {
    const where: any = {};

    // Default to ACTIVE if not provided
    where.status = status || ContentStatus.ACTIVE;

    if (accessLevel) {
      where.accessLevel = accessLevel;
    }

    const [data, total] = await Promise.all([
      this.prisma.programTemplate.findMany({
        where,
        select: {
          id: true,
          title: true,
          subtitle: true,
          sanskritTitle: true,
          descriptionShort: true,
          heroImageKey: true,
          primaryGoal: true,
          focusArea: true,
          recommendedLevel: true,
          defaultDays: true,
          defaultMinutesPerDay: true,
          benefits: true,
          whatYouNeed: true,
          safetyNotes: true,
          accessLevel: true,
          requiredEntitlementKey: true,
          status: true,
          version: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.programTemplate.count({ where }),
    ]);

    const dataWithUrls = await Promise.all(
      data.map(async (item) => ({
        ...item,
        heroImageUrl: item.heroImageKey
          ? await this.assetsService.getR2SignedUrl(item.heroImageKey)
          : null,
      }))
    );

    return {
      data: dataWithUrls as ProgramTemplateListItemDto[],
      total,
    };
  }

  async findOne(id: string): Promise<ProgramTemplateDetailDto> {
    const programTemplate = await this.prisma.programTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        sanskritTitle: true,
        descriptionShort: true,
        heroImageKey: true,
        primaryGoal: true,
        focusArea: true,
        recommendedLevel: true,
        defaultDays: true,
        defaultMinutesPerDay: true,
        benefits: true,
        whatYouNeed: true,
        safetyNotes: true,
        categoryRecipe: true,
        libraryRhythm: true,
        accessLevel: true,
        requiredEntitlementKey: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        librarySchedule: {
          select: {
            programTemplateId: true,
            generatedFromVersion: true,
            days: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!programTemplate) {
      throw new NotFoundException(`ProgramTemplate with id ${id} not found`);
    }

    const heroImageUrl = programTemplate.heroImageKey
      ? await this.assetsService.getR2SignedUrl(programTemplate.heroImageKey)
      : null;

    return {
      ...programTemplate,
      heroImageUrl,
      librarySchedule: programTemplate.librarySchedule as LibraryScheduleDto | null,
    } as ProgramTemplateDetailDto;
  }
}
