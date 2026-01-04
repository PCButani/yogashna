import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create user profile by firebaseUid
   */
  async getProfile(
    firebaseUid: string,
    phoneNumber?: string | null,
  ): Promise<UserProfileResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    // Create user if not exists (especially for DEV_USER)
    if (!user) {
      this.logger.log(`Creating new user profile for firebaseUid: ${firebaseUid}`);
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          phone: phoneNumber || null,
        },
      });
    }

    return this.formatUserResponse(user);
  }

  /**
   * Update user profile with partial data and recompute onboarding completion
   */
  async updateProfile(
    firebaseUid: string,
    phoneNumber: string | null,
    updateDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    // Ensure user exists
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      this.logger.log(`Creating new user during update: ${firebaseUid}`);
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          phone: phoneNumber,
        },
      });
    }

    // Convert height/weight if provided
    const heightCm = this.convertHeight(updateDto.height);
    const weightKg = this.convertWeight(updateDto.weight);

    // Build update payload
    const updateData: any = {};

    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.age !== undefined) updateData.age = updateDto.age;
    if (updateDto.gender !== undefined) updateData.gender = updateDto.gender;
    if (heightCm !== null) updateData.heightCm = heightCm;
    if (weightKg !== null) updateData.weightKg = weightKg;
    if (updateDto.wellnessFocusId !== undefined)
      updateData.wellnessFocusId = updateDto.wellnessFocusId;
    if (updateDto.primaryGoalId !== undefined)
      updateData.primaryGoalId = updateDto.primaryGoalId;
    if (updateDto.preferences !== undefined)
      updateData.preferencesJson = updateDto.preferences;

    // Apply updates
    user = await this.prisma.user.update({
      where: { firebaseUid },
      data: updateData,
    });

    // Check if onboarding is now complete
    const wasComplete = user.isOnboardingComplete;
    const isNowComplete = this.checkOnboardingComplete(user);

    if (!wasComplete && isNowComplete) {
      this.logger.log(`Onboarding completed for user: ${firebaseUid}`);
      user = await this.prisma.user.update({
        where: { firebaseUid },
        data: {
          isOnboardingComplete: true,
          onboardingCompletedAt: new Date(),
        },
      });
    } else if (wasComplete && !isNowComplete) {
      // Edge case: user removed required fields (rare, but handle it)
      user = await this.prisma.user.update({
        where: { firebaseUid },
        data: {
          isOnboardingComplete: false,
        },
      });
    }

    return this.formatUserResponse(user);
  }

  /**
   * Convert height input to cm
   */
  private convertHeight(height?: any): number | null {
    if (!height) return null;

    if (height.unit === 'cm' && height.valueCm) {
      return height.valueCm;
    }

    if (height.unit === 'ft_in' && height.feet !== undefined && height.inches !== undefined) {
      const totalInches = height.feet * 12 + height.inches;
      return Math.round(totalInches * 2.54);
    }

    return null;
  }

  /**
   * Convert weight input to kg
   */
  private convertWeight(weight?: any): number | null {
    if (!weight) return null;

    if (weight.unit === 'kg' && weight.valueKg) {
      return weight.valueKg;
    }

    if (weight.unit === 'lbs' && weight.lbs) {
      return Math.round(weight.lbs * 0.453592);
    }

    return null;
  }

  /**
   * Check if onboarding is complete based on required fields
   */
  private checkOnboardingComplete(user: any): boolean {
    const preferencesJson = user.preferencesJson as any;

    const hasBasicProfile =
      !!user.name &&
      user.age !== null &&
      !!user.gender &&
      user.heightCm !== null &&
      user.weightKg !== null;

    const hasSelections = !!user.wellnessFocusId && !!user.primaryGoalId;

    const hasPreferences =
      preferencesJson &&
      !!preferencesJson.sessionLength &&
      !!preferencesJson.preferredTime &&
      !!preferencesJson.experienceLevel;

    return hasBasicProfile && hasSelections && hasPreferences;
  }

  /**
   * Format user entity to response DTO
   */
  private formatUserResponse(user: any): UserProfileResponseDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      phoneNumber: user.phone,
      profile: {
        name: user.name,
        age: user.age,
        gender: user.gender,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
      },
      wellnessFocusId: user.wellnessFocusId,
      primaryGoalId: user.primaryGoalId,
      preferences: user.preferencesJson as Record<string, any> | null,
      onboarding: {
        isComplete: user.isOnboardingComplete,
        completedAt: user.onboardingCompletedAt
          ? user.onboardingCompletedAt.toISOString()
          : null,
      },
    };
  }
}
