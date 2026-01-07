import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class AbhyasaPlaylistGenerateRangeRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(21)
  fromDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(21)
  toDay?: number;

  @IsOptional()
  @IsBoolean()
  regenerate?: boolean;
}

export class AbhyasaPlaylistGenerateRangeErrorDto {
  dayNumber: number;
  code: string;
  message: string;
}

export class AbhyasaPlaylistGenerateRangeResponseDto {
  fromDay: number;
  toDayRequested: number;
  toDayEffective: number;
  regenerate: boolean;
  generatedDays: number[];
  skippedDays: number[];
  lockedDays: number[];
  errors: AbhyasaPlaylistGenerateRangeErrorDto[];
}
