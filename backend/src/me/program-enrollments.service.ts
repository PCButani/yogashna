import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import { SubscriptionPolicyService } from './subscription-policy.service';
import {
  CreateProgramEnrollmentDto,
  ProgramEnrollmentDto,
  ProgramEnrollmentListResponseDto,
} from './dto/program-enrollment.dto';

@Injectable()
export class ProgramEnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionPolicyService: SubscriptionPolicyService,
  ) {}

  async listEnrollments(firebaseUid: string): Promise<ProgramEnrollmentListResponseDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      return { data: [], total: 0 };
    }

    const enrollments = await this.prisma.userProgramEnrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: enrollments as ProgramEnrollmentDto[],
      total: enrollments.length,
    };
  }

  async createEnrollment(
    firebaseUid: string,
    body: CreateProgramEnrollmentDto,
  ): Promise<ProgramEnrollmentDto> {
    const userId = await this.getUserId(firebaseUid);
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const programTemplate = await this.prisma.programTemplate.findUnique({
      where: { id: body.programTemplateId },
      select: { id: true },
    });

    if (!programTemplate) {
      throw new NotFoundException('Program template not found');
    }

    const policy = await this.subscriptionPolicyService.getPolicyByUserId(userId);
    const maxActivePrograms = policy.maxActivePrograms;
    const activeCount = await this.subscriptionPolicyService.countActiveEnrollments(userId);

    if (activeCount >= maxActivePrograms) {
      throw new ConflictException({
        code: 'ABHYASA_SLOT_LIMIT_REACHED',
        message: 'Upgrade to unlock more Abhyasa slots',
        maxActivePrograms,
        activeCount,
      });
    }

    const enrollment = await this.prisma.userProgramEnrollment.upsert({
      where: {
        userId_programTemplateId: {
          userId,
          programTemplateId: body.programTemplateId,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
      },
      create: {
        userId,
        programTemplateId: body.programTemplateId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return enrollment as ProgramEnrollmentDto;
  }

  private async getUserId(firebaseUid: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    return user ? user.id : null;
  }
}
