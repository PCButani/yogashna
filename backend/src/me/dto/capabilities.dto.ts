export class CapabilitiesDto {
  tier: 'FREE' | 'PAID';
  isPaidActive: boolean;
  entitlement: string | null;
  programEnrollmentLimit: number;
  enrolledProgramsCount: number;
  canEnrollNewProgram: boolean;
  reasons: string[];
}
