import { DayType, SequenceRole } from '@prisma/client';

export class ProgramTemplateLibraryPlaylistItemDto {
  videoAssetId: string;
  role: SequenceRole;
  durationSec: number;
  order: number;
}

export class ProgramTemplateLibraryPlaylistPreviewDto {
  isPreview: true;
  mode: 'LIBRARY';
  dayNumber: number;
  dayType: DayType;
  targetDurationSec: number;
  totalDurationSec: number;
  playlistItems: ProgramTemplateLibraryPlaylistItemDto[];
}
