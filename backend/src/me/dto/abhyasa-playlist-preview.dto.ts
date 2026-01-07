import { DayType, SequenceRole } from '@prisma/client';

export class AbhyasaPlaylistPreviewItemDto {
  videoAssetId: string;
  role: SequenceRole;
  durationSec: number;
  order: number;
}

export class AbhyasaPlaylistPreviewDto {
  isPreview: true;
  dayNumber: number;
  targetDurationSec: number;
  dayType: DayType;
  totalDurationSec: number;
  playlistItems: AbhyasaPlaylistPreviewItemDto[];
}
