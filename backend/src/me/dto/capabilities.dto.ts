export class SubscriptionCapabilitiesDto {
  isActive: boolean;
  plan: 'FREE' | 'PAID';
  source: 'NONE' | 'APP_STORE' | 'PLAY_STORE' | 'WEB';
}

export class AbhyasaCapabilitiesDto {
  maxActivePrograms: number;
  freeUnlockDays: number;
}

export class UsageCapabilitiesDto {
  activeAbhyasaCount: number;
  remainingAbhyasaSlots: number;
}

export class CapabilitiesDto {
  tier: 'FREE' | 'PAID';
  isPaidActive: boolean;
  entitlement: string | null;
  programEnrollmentLimit: number;
  enrolledProgramsCount: number;
  canEnrollNewProgram: boolean;
  reasons: string[];
  subscription: SubscriptionCapabilitiesDto;
  abhyasa: AbhyasaCapabilitiesDto;
  usage: UsageCapabilitiesDto;
}
