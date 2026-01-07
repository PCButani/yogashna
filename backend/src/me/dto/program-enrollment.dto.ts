import { IsString, Matches } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateProgramEnrollmentDto {
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'programTemplateId must be a valid UUID format',
  })
  programTemplateId: string;
}

export class ProgramEnrollmentDto {
  id: string;
  programTemplateId: string;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramEnrollmentListResponseDto {
  data: ProgramEnrollmentDto[];
  total: number;
}
