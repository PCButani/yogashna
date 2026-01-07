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

type DayType = 'GENTLE' | 'BUILD' | 'RESTORE';

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

  async regenerateLibrarySchedule(programTemplateId: string): Promise<LibraryScheduleDto> {
    const programTemplate = await this.prisma.programTemplate.findUnique({
      where: { id: programTemplateId },
      select: {
        id: true,
        defaultDays: true,
        defaultMinutesPerDay: true,
        libraryRhythm: true,
        version: true,
      },
    });

    if (!programTemplate) {
      throw new NotFoundException(`ProgramTemplate with id ${programTemplateId} not found`);
    }

    const totalDurationSec = (programTemplate.defaultMinutesPerDay || 0) * 60;
    const dayTypes = this.buildDayTypes(programTemplate.libraryRhythm, programTemplate.defaultDays);
    const days = dayTypes.map((dayType, index) => ({
      dayNumber: index + 1,
      dayType,
      playlist: [],
      totalDurationSec,
    }));

    const generatedFromVersion = programTemplate.version
      ? String(programTemplate.version)
      : null;

    const schedule = await this.prisma.libraryProgramSchedule.upsert({
      where: {
        programTemplateId: programTemplate.id,
      },
      update: {
        generatedFromVersion,
        days,
      },
      create: {
        programTemplateId: programTemplate.id,
        generatedFromVersion,
        days,
      },
      select: {
        programTemplateId: true,
        generatedFromVersion: true,
        days: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return schedule as LibraryScheduleDto;
  }

  private buildDayTypes(libraryRhythm: any, defaultDays: number): DayType[] {
    if (!defaultDays || defaultDays <= 0) {
      return [];
    }

    if (!libraryRhythm || typeof libraryRhythm !== 'object') {
      return this.fillDays(defaultDays, 'GENTLE');
    }

    const pattern = Array.isArray(libraryRhythm.pattern) ? libraryRhythm.pattern : null;
    const types = Array.isArray(libraryRhythm.types) ? libraryRhythm.types : null;

    if (!pattern || !types || pattern.length === 0 || pattern.length !== types.length) {
      return this.fillDays(defaultDays, 'GENTLE');
    }

    const cycle: DayType[] = [];
    for (let i = 0; i < pattern.length; i += 1) {
      const count = Number(pattern[i]);
      const dayType = this.normalizeDayType(types[i]);
      if (!dayType || !Number.isFinite(count) || count <= 0) {
        return this.fillDays(defaultDays, 'GENTLE');
      }
      for (let j = 0; j < Math.floor(count); j += 1) {
        cycle.push(dayType);
      }
    }

    if (cycle.length === 0) {
      return this.fillDays(defaultDays, 'GENTLE');
    }

    const result: DayType[] = [];
    for (let i = 0; i < defaultDays; i += 1) {
      result.push(cycle[i % cycle.length]);
    }
    return result;
  }

  private normalizeDayType(value: unknown): DayType | null {
    if (typeof value !== 'string') {
      return null;
    }
    switch (value.trim().toLowerCase()) {
      case 'gentle':
        return 'GENTLE';
      case 'build':
        return 'BUILD';
      case 'restore':
        return 'RESTORE';
      default:
        return null;
    }
  }

  private fillDays(count: number, dayType: DayType): DayType[] {
    return Array.from({ length: count }, () => dayType);
  }
}
