import {
  IsString,
  IsInt,
  IsIn,
  IsObject,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class HeightDto {
  @IsIn(['cm', 'ft_in'])
  unit: 'cm' | 'ft_in';

  @IsOptional()
  @IsInt()
  @Min(120)
  @Max(220)
  valueCm?: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(8)
  feet?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  inches?: number;
}

class WeightDto {
  @IsIn(['kg', 'lbs'])
  unit: 'kg' | 'lbs';

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(250)
  valueKg?: number;

  @IsOptional()
  @IsInt()
  @Min(66)
  @Max(551)
  lbs?: number;
}

class PreferencesDto {
  @IsOptional()
  @IsIn(['quick', 'balanced', 'deep'])
  sessionLength?: 'quick' | 'balanced' | 'deep';

  @IsOptional()
  @IsIn(['morning', 'evening', 'anytime'])
  preferredTime?: 'morning' | 'evening' | 'anytime';

  @IsOptional()
  @IsIn(['beginner', 'intermediate'])
  experienceLevel?: 'beginner' | 'intermediate';
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(80)
  age?: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

  @IsOptional()
  @ValidateNested()
  @Type(() => HeightDto)
  height?: HeightDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeightDto)
  weight?: WeightDto;

  @IsOptional()
  @IsString()
  wellnessFocusId?: string;

  @IsOptional()
  @IsString()
  primaryGoalId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}
