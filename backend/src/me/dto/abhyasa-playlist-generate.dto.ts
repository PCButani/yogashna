import { DayType, SequenceRole } from '@prisma/client';

export class AbhyasaPlaylistGeneratedItemDto {
  id: string;
  videoAssetId: string;
  role: SequenceRole;
  durationSec: number;
  order: number;
}

export class AbhyasaPlaylistGenerateDto {
  isPreview: false;
  dayNumber: number;
  dayType: DayType;
  totalDurationSec: number;
  playlistItems: AbhyasaPlaylistGeneratedItemDto[];
}
