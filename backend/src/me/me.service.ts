import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CapabilitiesDto } from './dto/capabilities.dto';
import { SubscriptionPolicyService } from './subscription-policy.service';

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionPolicyService: SubscriptionPolicyService,
  ) {}

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

    const subscriptionPolicy = await this.subscriptionPolicyService.getPolicyByUserId(userId);
    const tier = subscriptionPolicy.tier;
    const isPaidActive = subscriptionPolicy.isPaidActive;
    const entitlement = subscriptionPolicy.entitlement;
    const subscriptionSource = subscriptionPolicy.subscriptionSource;

    // Determine enrollment limit
    const programEnrollmentLimit = subscriptionPolicy.maxActivePrograms;
    const freeUnlockDays = subscriptionPolicy.freeUnlockDays;

    // Count active enrollments
    const enrolledProgramsCount = await this.subscriptionPolicyService.countActiveEnrollments(
      userId
    );

    const activeAbhyasaCount = enrolledProgramsCount;

    const remainingAbhyasaSlots = Math.max(0, programEnrollmentLimit - activeAbhyasaCount);

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
      subscription: {
        isActive: isPaidActive,
        plan: tier,
        source: subscriptionSource,
      },
      abhyasa: {
        maxActivePrograms: programEnrollmentLimit,
        freeUnlockDays,
      },
      usage: {
        activeAbhyasaCount,
        remainingAbhyasaSlots,
      },
    };
  }
}
