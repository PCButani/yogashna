import {
  VideoPrimaryCategory,
  YogaSubCategory,
  BreathingSubCategory,
  MeditationSubCategory,
  VideoLevel,
  VideoIntensity,
  VideoStrengthDemand,
  SequenceRole,
  ContentStatus,
} from '@prisma/client';

export class VideoAssetDto {
  id: string;
  name: string;
  shortDescription: string;
  thumbnailKey: string;
  thumbnailUrl: string | null;
  streamUid: string;
  playbackUrl: string | null;
  primaryCategory: VideoPrimaryCategory;
  yogaSubCategory: YogaSubCategory | null;
  breathingSubCategory: BreathingSubCategory | null;
  meditationSubCategory: MeditationSubCategory | null;
  level: VideoLevel;
  intensity: VideoIntensity;
  strengthDemand: VideoStrengthDemand;
  focusAreas: any; // JSON array
  goals: any; // JSON array
  sequenceRole: SequenceRole;
  durationSec: number;
  caloriesPerMin: number | null;
  contraIndications: any | null; // JSON array
  status: ContentStatus;
  version: string;
  tags: any | null; // JSON array
  createdAt: Date;
  updatedAt: Date;
}

export class VideoAssetListResponseDto {
  data: VideoAssetDto[];
  total: number;
  take: number;
  skip: number;
}
