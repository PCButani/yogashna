import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EnrollmentStatus, SubscriptionTier } from '@prisma/client';

export type SubscriptionPlan = 'FREE' | 'PAID';
export type SubscriptionSource = 'NONE' | 'APP_STORE' | 'PLAY_STORE' | 'WEB';

export interface SubscriptionPolicy {
  isPaidActive: boolean;
  tier: SubscriptionPlan;
  freeUnlockDays: number;
  maxActivePrograms: number;
  subscriptionSource: SubscriptionSource;
  entitlement: string | null;
}

@Injectable()
export class SubscriptionPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getPolicyByUserId(userId?: string | null): Promise<SubscriptionPolicy> {
    if (!userId) {
      return {
        isPaidActive: false,
        tier: 'FREE',
        freeUnlockDays: 5,
        maxActivePrograms: 1,
        subscriptionSource: 'NONE',
        entitlement: null,
      };
    }

    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });

    let tier: SubscriptionPlan = 'FREE';
    let isPaidActive = false;
    let entitlement: string | null = null;
    let subscriptionSource: SubscriptionSource = 'NONE';

    if (subscription) {
      subscriptionSource = this.resolveSource(subscription.store);
      if (subscription.isActive && subscription.tier === SubscriptionTier.PAID) {
        tier = 'PAID';
        isPaidActive = true;
        entitlement = subscription.entitlement;
      }
    }

    return {
      isPaidActive,
      tier,
      freeUnlockDays: tier === 'PAID' ? 21 : 5,
      maxActivePrograms: tier === 'PAID' ? 5 : 1,
      subscriptionSource,
      entitlement,
    };
  }

  async countActiveEnrollments(userId?: string | null): Promise<number> {
    if (!userId) {
      return 0;
    }

    return this.prisma.userProgramEnrollment.count({
      where: {
        userId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  private resolveSource(store?: string | null): SubscriptionSource {
    if (!store) {
      return 'NONE';
    }

    const normalized = store.toLowerCase();
    if (normalized.includes('app')) {
      return 'APP_STORE';
    }
    if (normalized.includes('play')) {
      return 'PLAY_STORE';
    }
    if (normalized.includes('web')) {
      return 'WEB';
    }

    return 'NONE';
  }
}
