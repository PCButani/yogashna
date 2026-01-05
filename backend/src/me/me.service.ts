import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscriptionTier } from '@prisma/client';
import { CapabilitiesDto } from './dto/capabilities.dto';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCapabilities(firebaseUid: string): Promise<CapabilitiesDto> {
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      // Auto-create user if doesn't exist (following existing pattern)
      user = await this.prisma.user.create({
        data: { firebaseUid },
        select: { id: true },
      });
    }

    const userId = user.id;

    // Get subscription
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });

    // Determine tier and active status
    let tier: 'FREE' | 'PAID' = 'FREE';
    let isPaidActive = false;
    let entitlement: string | null = null;

    if (subscription && subscription.isActive && subscription.tier === SubscriptionTier.PAID) {
      tier = 'PAID';
      isPaidActive = true;
      entitlement = subscription.entitlement;
    }

    // Determine enrollment limit
    const programEnrollmentLimit = tier === 'PAID' ? 5 : 1;

    // Count enrolled programs (ALL statuses)
    const enrolledProgramsCount = await this.prisma.userProgramEnrollment.count({
      where: { userId },
    });

    // Determine if can enroll
    const canEnrollNewProgram = enrolledProgramsCount < programEnrollmentLimit;

    // Build reasons
    const reasons: string[] = [];
    if (!canEnrollNewProgram) {
      reasons.push('PROGRAM_LIMIT_REACHED');
    }

    return {
      tier,
      isPaidActive,
      entitlement,
      programEnrollmentLimit,
      enrolledProgramsCount,
      canEnrollNewProgram,
      reasons,
    };
  }
}
