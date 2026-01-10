import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  BreathingSubCategory,
  ContentStatus,
  DayType,
  EnrollmentStatus,
  MeditationSubCategory,
  SequenceRole,
  VideoPrimaryCategory,
  YogaSubCategory,
} from '@prisma/client';
import {
  AbhyasaCycleSummaryDto,
  AbhyasaDayNotFoundDto,
  AbhyasaDayLockDto,
  AbhyasaDayResponseDto,
} from './dto/abhyasa-cycle.dto';
import {
  AbhyasaPlaylistPreviewDto,
  AbhyasaPlaylistPreviewItemDto,
} from './dto/abhyasa-playlist-preview.dto';
import {
  AbhyasaPlaylistGenerateDto,
  AbhyasaPlaylistGeneratedItemDto,
} from './dto/abhyasa-playlist-generate.dto';
import {
  AbhyasaPlaylistGenerateRangeRequestDto,
  AbhyasaPlaylistGenerateRangeResponseDto,
  AbhyasaPlaylistGenerateRangeErrorDto,
} from './dto/abhyasa-playlist-generate-range.dto';
import { SubscriptionPolicyService } from './subscription-policy.service';
import { PlaylistSelectionService } from '../common/playlist/playlist-selection.service';
import { AssetsService } from '../assets/assets.service';

type PlaylistCandidate = {
  id: string;
  sequenceRole: SequenceRole;
  durationSec: number;
  contraIndications: any | null;
  primaryCategory: VideoPrimaryCategory;
  yogaSubCategory: YogaSubCategory | null;
  breathingSubCategory: BreathingSubCategory | null;
  meditationSubCategory: MeditationSubCategory | null;
};

type PlaylistSelectionItem = {
  videoAssetId: string;
  role: SequenceRole;
  durationSec: number;
  primaryCategory: VideoPrimaryCategory;
  yogaSubCategory: YogaSubCategory | null;
  breathingSubCategory: BreathingSubCategory | null;
  meditationSubCategory: MeditationSubCategory | null;
};

@Injectable()
export class AbhyasaCycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionPolicyService: SubscriptionPolicyService,
    private readonly playlistSelectionService: PlaylistSelectionService,
    private readonly assetsService: AssetsService,
  ) {}

  async getCycleSummary(
    firebaseUid: string,
    programTemplateId: string,
  ): Promise<AbhyasaCycleSummaryDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      return {
        hasCycle: false,
        cycleId: null,
        startDate: null,
        cycleLengthDays: 21,
      };
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: {
        userId,
        programTemplateId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        startDate: true,
        cycleDays: true,
      },
    });

    if (!cycle) {
      return {
        hasCycle: false,
        cycleId: null,
        startDate: null,
        cycleLengthDays: 21,
      };
    }

    return {
      hasCycle: true,
      cycleId: cycle.id,
      startDate: cycle.startDate ? cycle.startDate.toISOString() : null,
      cycleLengthDays: cycle.cycleDays || 21,
    };
  }

  async getDay(
    firebaseUid: string,
    programTemplateId: string,
    dayNumber: number,
  ): Promise<AbhyasaDayResponseDto | AbhyasaDayNotFoundDto> {
    const userId = await this.getUserId(firebaseUid);
    const subscriptionPolicy = await this.subscriptionPolicyService.getPolicyByUserId(userId);
    if (!subscriptionPolicy.isPaidActive && dayNumber > subscriptionPolicy.freeUnlockDays) {
      const dayType = await this.getLockedDayType(userId, programTemplateId, dayNumber);
      return this.buildLockedDay(dayNumber, dayType, subscriptionPolicy.freeUnlockDays);
    }

    if (!userId) {
      return { exists: false, dayNumber };
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: {
        userId,
        programTemplateId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
      },
    });

    if (!cycle) {
      return { exists: false, dayNumber };
    }

    const dayPlan = await this.prisma.abhyasaDayPlan.findFirst({
      where: {
        abhyasaCycleId: cycle.id,
        dayNumber,
      },
      include: {
        playlistItems: {
          // Fallback ordering: PlaylistItem has no stable order field in schema.
          orderBy: { createdAt: 'asc' },
          include: {
            videoAsset: {
              select: {
                id: true,
                name: true,
                streamUid: true,
                thumbnailKey: true,
              },
            },
          },
        },
      },
    });

    if (!dayPlan) {
      return { exists: false, dayNumber };
    }

    const playlistItems = await Promise.all(
      dayPlan.playlistItems.map(async (item, index) => {
        const playbackUrl = item.videoAsset.streamUid
          ? await this.assetsService.getStreamPlaybackUrl(item.videoAsset.streamUid)
          : null;
        const thumbnailUrl = item.videoAsset.thumbnailKey
          ? await this.assetsService.getR2SignedUrl(item.videoAsset.thumbnailKey)
          : null;

        return {
          order: index + 1,
          role: item.sequenceRole,
          durationSec: item.durationSec,
          videoAsset: {
            id: item.videoAsset.id,
            title: item.videoAsset.name,
            streamUid: item.videoAsset.streamUid,
            playbackUrl,
            thumbnailUrl,
          },
        };
      })
    );

    return {
      dayNumber: dayPlan.dayNumber,
      dayType: dayPlan.dayType,
      totalDurationSec: dayPlan.totalDurationSec || 0,
      isLocked: false,
      playlistItems,
    };
  }

  async getToday(
    firebaseUid: string,
    programTemplateId: string,
  ): Promise<AbhyasaDayResponseDto | AbhyasaDayNotFoundDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      return { exists: false, dayNumber: 1 };
    }

    const subscriptionPolicy = await this.subscriptionPolicyService.getPolicyByUserId(userId);

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: {
        userId,
        programTemplateId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        startDate: true,
        cycleDays: true,
      },
    });

    if (!cycle) {
      return { exists: false, dayNumber: 1 };
    }

    if (!cycle.startDate || Number.isNaN(cycle.startDate.getTime())) {
      throw new NotImplementedException(
        'today not available until cycle has start date',
      );
    }

    const nowMs = Date.now();
    const startMs = cycle.startDate.getTime();
    const msPerDay = 24 * 60 * 60 * 1000;
    const rawDayNumber = Math.floor((nowMs - startMs) / msPerDay) + 1;
    const maxDays = cycle.cycleDays || 21;
    const dayNumber = Math.min(maxDays, Math.max(1, rawDayNumber));

    if (!subscriptionPolicy.isPaidActive && dayNumber > subscriptionPolicy.freeUnlockDays) {
      const dayType = await this.getDayTypeByCycleId(cycle.id, dayNumber);
      return this.buildLockedDay(dayNumber, dayType, subscriptionPolicy.freeUnlockDays);
    }

    return this.getDayByCycleId(cycle.id, dayNumber);
  }

  async generateCycle(
    firebaseUid: string,
    programTemplateId: string,
  ): Promise<AbhyasaCycleSummaryDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating Abhyasa cycle',
      });
    }

    const enrollment = await this.prisma.userProgramEnrollment.findFirst({
      where: {
        userId,
        programTemplateId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating Abhyasa cycle',
      });
    }

    const programTemplate = await this.prisma.programTemplate.findUnique({
      where: { id: programTemplateId },
      select: { defaultMinutesPerDay: true },
    });

    if (!programTemplate) {
      throw new NotFoundException('Program template not found');
    }

    const existing = await this.prisma.abhyasaCycle.findFirst({
      where: {
        userId,
        programTemplateId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        startDate: true,
        cycleDays: true,
      },
    });

    if (existing) {
      return {
        hasCycle: true,
        cycleId: existing.id,
        startDate: existing.startDate ? existing.startDate.toISOString() : null,
        cycleLengthDays: existing.cycleDays || 21,
      };
    }

    const schedule = await this.prisma.libraryProgramSchedule.findUnique({
      where: { programTemplateId },
      select: { days: true },
    });

    const scheduleDays = Array.isArray(schedule?.days) ? schedule?.days : [];
    const cycleLengthDays = 21;
    const minutesPreference = programTemplate.defaultMinutesPerDay ?? 20;

    const cycle = await this.prisma.$transaction(async (tx) => {
      const existingInTx = await tx.abhyasaCycle.findFirst({
        where: {
          userId,
          programTemplateId,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          startDate: true,
          cycleDays: true,
        },
      });

      if (existingInTx) {
        return existingInTx;
      }

      const created = await tx.abhyasaCycle.create({
        data: {
          userId,
          programTemplateId,
          startDate: new Date(),
          cycleDays: cycleLengthDays,
          minutesPreference,
        },
        select: {
          id: true,
          startDate: true,
          cycleDays: true,
        },
      });

      const dayPlansData = Array.from({ length: cycleLengthDays }, (_, index) => {
        const dayNumber = index + 1;
        const dayType = this.resolveDayTypeFromSchedule(scheduleDays, dayNumber);
        return {
          abhyasaCycleId: created.id,
          dayNumber,
          dayType,
          totalDurationSec: 0,
        };
      });

      // TODO: Improve day type derivation when schedule data is unavailable.
      await tx.abhyasaDayPlan.createMany({
        data: dayPlansData,
      });

      return created;
    });

    return {
      hasCycle: true,
      cycleId: cycle.id,
      startDate: cycle.startDate ? cycle.startDate.toISOString() : null,
      cycleLengthDays: cycle.cycleDays || 21,
    };
  }

  async previewPlaylist(
    firebaseUid: string,
    programTemplateId: string,
    dayNumber: number,
  ): Promise<AbhyasaPlaylistPreviewDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before previewing playlist',
      });
    }

    const enrollment = await this.prisma.userProgramEnrollment.findFirst({
      where: {
        userId,
        programTemplateId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before previewing playlist',
      });
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: { userId, programTemplateId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, minutesPreference: true },
    });

    if (!cycle) {
      throw new NotFoundException('Abhyasa cycle not found');
    }

    const dayPlan = await this.getDayPlan(cycle.id, dayNumber);
    if (!dayPlan) {
      throw new NotFoundException('Abhyasa day plan not found');
    }

    const selection = await this.buildPlaylistSelection(userId, cycle, dayPlan, dayNumber);
    const playlistItems: AbhyasaPlaylistPreviewItemDto[] = selection.items.map(
      (item, index) => ({
        videoAssetId: item.videoAssetId,
        role: item.role,
        durationSec: item.durationSec,
        order: index + 1,
      })
    );

    return {
      isPreview: true,
      dayNumber,
      targetDurationSec: selection.targetDurationSec,
      dayType: dayPlan.dayType,
      totalDurationSec: selection.totalDurationSec,
      playlistItems,
    };
  }

  async generatePlaylist(
    firebaseUid: string,
    programTemplateId: string,
    dayNumber: number,
    regenerate: boolean,
  ): Promise<AbhyasaPlaylistGenerateDto | AbhyasaDayResponseDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating playlist',
      });
    }

    const enrollment = await this.prisma.userProgramEnrollment.findFirst({
      where: {
        userId,
        programTemplateId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating playlist',
      });
    }

    const subscriptionPolicy = await this.subscriptionPolicyService.getPolicyByUserId(userId);
    if (!subscriptionPolicy.isPaidActive && dayNumber > subscriptionPolicy.freeUnlockDays) {
      const dayType = await this.getLockedDayType(userId, programTemplateId, dayNumber);
      return this.buildLockedDay(dayNumber, dayType, subscriptionPolicy.freeUnlockDays);
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: { userId, programTemplateId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, minutesPreference: true },
    });

    if (!cycle) {
      throw new NotFoundException('Abhyasa cycle not found');
    }

    const dayPlanWithItems = await this.prisma.abhyasaDayPlan.findFirst({
      where: { abhyasaCycleId: cycle.id, dayNumber },
      include: {
        playlistItems: {
          // Fallback ordering: PlaylistItem has no stable order field in schema.
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dayPlanWithItems) {
      throw new NotFoundException('Abhyasa day plan not found');
    }

    if (dayPlanWithItems.playlistItems.length > 0 && !regenerate) {
      return this.buildGeneratedResponseFromItems(
        dayNumber,
        dayPlanWithItems.dayType,
        dayPlanWithItems.playlistItems,
      );
    }

    const selection = await this.buildPlaylistSelection(
      userId,
      cycle,
      dayPlanWithItems,
      dayNumber,
    );

    const createdItems = await this.prisma.$transaction(async (tx) => {
      if (regenerate) {
        await tx.playlistItem.deleteMany({
          where: { abhyasaDayPlanId: dayPlanWithItems.id },
        });
      }

      const results: AbhyasaPlaylistGeneratedItemDto[] = [];
      let order = 1;
      for (const item of selection.items) {
        const created = await tx.playlistItem.create({
          data: {
            abhyasaDayPlanId: dayPlanWithItems.id,
            videoAssetId: item.videoAssetId,
            primaryCategory: item.primaryCategory,
            yogaSubCategory: item.yogaSubCategory,
            breathingSubCategory: item.breathingSubCategory,
            meditationSubCategory: item.meditationSubCategory,
            sequenceRole: item.role,
            durationSec: item.durationSec,
          },
          select: {
            id: true,
            videoAssetId: true,
            sequenceRole: true,
            durationSec: true,
          },
        });

        results.push({
          id: created.id,
          videoAssetId: created.videoAssetId,
          role: created.sequenceRole,
          durationSec: created.durationSec,
          order,
        });
        order += 1;
      }

      await tx.abhyasaDayPlan.update({
        where: { id: dayPlanWithItems.id },
        data: {
          totalDurationSec: selection.totalDurationSec,
          dayType: dayPlanWithItems.dayType,
        },
      });

      return results;
    });

    return {
      isPreview: false,
      dayNumber,
      dayType: dayPlanWithItems.dayType,
      totalDurationSec: selection.totalDurationSec,
      playlistItems: createdItems,
    };
  }

  async generatePlaylistRange(
    firebaseUid: string,
    programTemplateId: string,
    body: AbhyasaPlaylistGenerateRangeRequestDto,
  ): Promise<AbhyasaPlaylistGenerateRangeResponseDto> {
    const fromDay = body.fromDay ?? 1;
    const toDayRequested = body.toDay ?? 21;
    const regenerate = body.regenerate ?? false;

    if (!Number.isInteger(fromDay) || !Number.isInteger(toDayRequested)) {
      throw new BadRequestException('fromDay and toDay must be integers');
    }
    if (fromDay < 1 || toDayRequested > 21 || fromDay > toDayRequested) {
      throw new BadRequestException('fromDay and toDay must be within 1..21 and fromDay <= toDay');
    }
    if (toDayRequested - fromDay + 1 > 21) {
      throw new BadRequestException('Requested day range exceeds maximum allowed size');
    }

    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating playlist range',
      });
    }

    const enrollment = await this.prisma.userProgramEnrollment.findFirst({
      where: {
        userId,
        programTemplateId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new ForbiddenException({
        code: 'PROGRAM_NOT_ENROLLED',
        message: 'Program enrollment required before generating playlist range',
      });
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: { userId, programTemplateId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (!cycle) {
      throw new NotFoundException('Abhyasa cycle not found');
    }

    const subscriptionPolicy = await this.subscriptionPolicyService.getPolicyByUserId(userId);
    const toDayEffective = subscriptionPolicy.isPaidActive
      ? toDayRequested
      : Math.min(toDayRequested, subscriptionPolicy.freeUnlockDays);

    const lockedDaySet = new Set<number>(
      subscriptionPolicy.isPaidActive
        ? []
        : this.buildRange(
            Math.max(fromDay, subscriptionPolicy.freeUnlockDays + 1),
            toDayRequested,
          )
    );

    const effectiveRangeDays =
      fromDay <= toDayEffective ? toDayEffective - fromDay + 1 : 0;

    if (effectiveRangeDays > 0) {
      const dayPlansCount = await this.prisma.abhyasaDayPlan.count({
        where: {
          abhyasaCycleId: cycle.id,
          dayNumber: { gte: fromDay, lte: toDayEffective },
        },
      });

      if (dayPlansCount < effectiveRangeDays) {
        throw new NotFoundException('Abhyasa day plans not found');
      }
    }

    const generatedDays: number[] = [];
    const skippedDays: number[] = [];
    const errors: AbhyasaPlaylistGenerateRangeErrorDto[] = [];

    const existingDaySet = new Set<number>();
    if (!regenerate && effectiveRangeDays > 0) {
      const existingDays = await this.prisma.abhyasaDayPlan.findMany({
        where: {
          abhyasaCycleId: cycle.id,
          dayNumber: { gte: fromDay, lte: toDayEffective },
          playlistItems: { some: {} },
        },
        select: { dayNumber: true },
      });
      existingDays.forEach((day) => existingDaySet.add(day.dayNumber));
    }

    for (let day = fromDay; day <= toDayEffective; day += 1) {
      if (!regenerate && existingDaySet.has(day)) {
        skippedDays.push(day);
        continue;
      }

      try {
        const result = await this.generatePlaylist(
          firebaseUid,
          programTemplateId,
          day,
          regenerate,
        );
        if ('isLocked' in result && result.isLocked) {
          lockedDaySet.add(day);
        } else {
          generatedDays.push(day);
        }
      } catch (error: any) {
        errors.push({
          dayNumber: day,
          code: error?.response?.code || 'ERROR',
          message: error?.response?.message || error?.message || 'Unknown error',
        });
      }
    }

    return {
      fromDay,
      toDayRequested,
      toDayEffective,
      regenerate,
      generatedDays,
      skippedDays,
      lockedDays: Array.from(lockedDaySet).sort((a, b) => a - b),
      errors,
    };
  }

  private buildRange(start: number, end: number): number[] {
    if (start > end) {
      return [];
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  private async getDayPlan(
    cycleId: string,
    dayNumber: number,
  ): Promise<{ id: string; dayType: DayType; totalDurationSec: number } | null> {
    return this.prisma.abhyasaDayPlan.findFirst({
      where: { abhyasaCycleId: cycleId, dayNumber },
      select: {
        id: true,
        dayType: true,
        totalDurationSec: true,
      },
    });
  }

  private async buildPlaylistSelection(
    userId: string,
    cycle: { id: string; minutesPreference: number | null },
    dayPlan: { id: string; dayType: DayType },
    dayNumber: number,
  ): Promise<{
    targetDurationSec: number;
    totalDurationSec: number;
    items: PlaylistSelectionItem[];
  }> {
    const practicePreferences = await this.prisma.practicePreferences.findUnique({
      where: { userId },
      select: { minutesPreference: true, level: true },
    });

    const minutesPreference =
      practicePreferences?.minutesPreference ?? cycle.minutesPreference ?? 20;
    const targetDurationSec = minutesPreference * 60;
    const preferredLevel = practicePreferences?.level ?? null;

    const excludedIds = await this.getRecentVideoAssetIds(cycle.id, dayNumber);

    const candidates: PlaylistCandidate[] = await this.prisma.videoAsset.findMany({
      where: {
        status: ContentStatus.ACTIVE,
        ...(preferredLevel ? { level: preferredLevel } : {}),
        ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
      },
      select: {
        id: true,
        sequenceRole: true,
        durationSec: true,
        contraIndications: true,
        primaryCategory: true,
        yogaSubCategory: true,
        breathingSubCategory: true,
        meditationSubCategory: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const filteredCandidates = this.filterByContraindications(candidates, []);

    const items: PlaylistSelectionItem[] = [];
    const selection = this.playlistSelectionService.selectByRole(
      filteredCandidates,
      targetDurationSec,
    );
    let totalDurationSec = 0;
    selection.items.forEach((item) => {
      items.push({
        videoAssetId: item.id,
        role: item.sequenceRole,
        durationSec: item.durationSec,
        primaryCategory: item.primaryCategory,
        yogaSubCategory: item.yogaSubCategory,
        breathingSubCategory: item.breathingSubCategory,
        meditationSubCategory: item.meditationSubCategory,
      });
      totalDurationSec += item.durationSec;
    });

    return {
      targetDurationSec,
      totalDurationSec,
      items,
    };
  }

  private buildGeneratedResponseFromItems(
    dayNumber: number,
    dayType: DayType,
    playlistItems: Array<{
      id: string;
      videoAssetId: string;
      sequenceRole: SequenceRole;
      durationSec: number;
    }>,
  ): AbhyasaPlaylistGenerateDto {
    const items: AbhyasaPlaylistGeneratedItemDto[] = playlistItems.map((item, index) => ({
      id: item.id,
      videoAssetId: item.videoAssetId,
      role: item.sequenceRole,
      durationSec: item.durationSec,
      order: index + 1,
    }));

    const totalDurationSec = items.reduce((sum, item) => sum + item.durationSec, 0);

    return {
      isPreview: false,
      dayNumber,
      dayType,
      totalDurationSec,
      playlistItems: items,
    };
  }

  private buildLockedDay(
    dayNumber: number,
    dayType: DayType | null,
    freeUnlockDays: number,
  ): AbhyasaDayResponseDto {
    const lock: AbhyasaDayLockDto = {
      reason: 'SUBSCRIPTION_REQUIRED_AFTER_FREE_DAYS',
      freeUnlockDays,
      lockedFromDay: freeUnlockDays + 1,
    };

    return {
      dayNumber,
      dayType,
      totalDurationSec: 0,
      isLocked: true,
      lock,
      playlistItems: [],
    };
  }

  private async getLockedDayType(
    userId: string | null,
    programTemplateId: string,
    dayNumber: number,
  ): Promise<DayType | null> {
    if (!userId) {
      return null;
    }

    const cycle = await this.prisma.abhyasaCycle.findFirst({
      where: {
        userId,
        programTemplateId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
      },
    });

    if (!cycle) {
      return null;
    }

    return this.getDayTypeByCycleId(cycle.id, dayNumber);
  }

  private async getDayTypeByCycleId(
    cycleId: string,
    dayNumber: number,
  ): Promise<DayType | null> {
    const dayPlan = await this.prisma.abhyasaDayPlan.findFirst({
      where: {
        abhyasaCycleId: cycleId,
        dayNumber,
      },
      select: {
        dayType: true,
      },
    });

    return dayPlan ? dayPlan.dayType : null;
  }

  private async getDayByCycleId(
    cycleId: string,
    dayNumber: number,
  ): Promise<AbhyasaDayResponseDto | AbhyasaDayNotFoundDto> {
    const dayPlan = await this.prisma.abhyasaDayPlan.findFirst({
      where: {
        abhyasaCycleId: cycleId,
        dayNumber,
      },
      include: {
        playlistItems: {
          // Fallback ordering: PlaylistItem has no stable order field in schema.
          orderBy: { createdAt: 'asc' },
          include: {
            videoAsset: {
              select: {
                id: true,
                name: true,
                streamUid: true,
                thumbnailKey: true,
              },
            },
          },
        },
      },
    });

    if (!dayPlan) {
      return { exists: false, dayNumber };
    }

    const playlistItems = await Promise.all(
      dayPlan.playlistItems.map(async (item, index) => {
        const playbackUrl = item.videoAsset.streamUid
          ? await this.assetsService.getStreamPlaybackUrl(item.videoAsset.streamUid)
          : null;
        const thumbnailUrl = item.videoAsset.thumbnailKey
          ? await this.assetsService.getR2SignedUrl(item.videoAsset.thumbnailKey)
          : null;

        return {
          order: index + 1,
          role: item.sequenceRole,
          durationSec: item.durationSec,
          videoAsset: {
            id: item.videoAsset.id,
            title: item.videoAsset.name,
            streamUid: item.videoAsset.streamUid,
            playbackUrl,
            thumbnailUrl,
          },
        };
      })
    );

    return {
      dayNumber: dayPlan.dayNumber,
      dayType: dayPlan.dayType,
      totalDurationSec: dayPlan.totalDurationSec || 0,
      isLocked: false,
      playlistItems,
    };
  }

  private async getRecentVideoAssetIds(
    cycleId: string,
    dayNumber: number,
  ): Promise<string[]> {
    if (dayNumber <= 1) {
      return [];
    }

    const startDay = Math.max(1, dayNumber - 7);
    const endDay = dayNumber - 1;

    const dayPlans = await this.prisma.abhyasaDayPlan.findMany({
      where: {
        abhyasaCycleId: cycleId,
        dayNumber: { gte: startDay, lte: endDay },
      },
      select: {
        playlistItems: {
          select: { videoAssetId: true },
        },
      },
    });

    const ids = new Set<string>();
    dayPlans.forEach((plan) => {
      plan.playlistItems.forEach((item) => {
        ids.add(item.videoAssetId);
      });
    });

    return Array.from(ids);
  }

  private filterByContraindications(
    candidates: PlaylistCandidate[],
    userContraindications: string[],
  ): PlaylistCandidate[] {
    if (!userContraindications.length) {
      return candidates;
    }

    return candidates.filter((item) => {
      const list = Array.isArray(item.contraIndications) ? item.contraIndications : [];
      return !list.some((contra) => userContraindications.includes(String(contra)));
    });
  }

  private resolveDayTypeFromSchedule(scheduleDays: any[], dayNumber: number): DayType {
    if (!Array.isArray(scheduleDays) || scheduleDays.length === 0) {
      return DayType.GENTLE;
    }

    const directMatch = scheduleDays.find(
      (day) => day && typeof day === 'object' && day.dayNumber === dayNumber,
    );
    const fallbackEntry = scheduleDays[dayNumber - 1];
    const rawType = directMatch?.dayType ?? fallbackEntry?.dayType;

    return this.normalizeDayType(rawType);
  }

  private normalizeDayType(value: unknown): DayType {
    if (typeof value !== 'string') {
      return DayType.GENTLE;
    }

    switch (value.trim().toUpperCase()) {
      case 'GENTLE':
        return DayType.GENTLE;
      case 'BUILD':
        return DayType.BUILD;
      case 'RESTORE':
        return DayType.RESTORE;
      default:
        return DayType.GENTLE;
    }
  }

  private async getUserId(firebaseUid: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    return user ? user.id : null;
  }
}
