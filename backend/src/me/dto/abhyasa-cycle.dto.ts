import { DayType, SequenceRole } from '@prisma/client';

export class AbhyasaCycleSummaryDto {
  hasCycle: boolean;
  cycleId: string | null;
  startDate: string | null;
  cycleLengthDays: number;
}

export class AbhyasaDayVideoAssetDto {
  id: string;
  title: string;
  streamUid: string;
  playbackUrl: string | null;
  thumbnailUrl: string | null;
}

export class AbhyasaDayPlaylistItemDto {
  order: number;
  role: SequenceRole;
  durationSec: number;
  videoAsset: AbhyasaDayVideoAssetDto;
}

export class AbhyasaDayLockDto {
  reason: 'SUBSCRIPTION_REQUIRED_AFTER_FREE_DAYS';
  freeUnlockDays: number;
  lockedFromDay: number;
}

export class AbhyasaDayResponseDto {
  dayNumber: number;
  dayType: DayType | null;
  totalDurationSec: number;
  isLocked: boolean;
  lock?: AbhyasaDayLockDto;
  playlistItems: AbhyasaDayPlaylistItemDto[];
}

export class AbhyasaDayNotFoundDto {
  exists: false;
  dayNumber: number;
}
