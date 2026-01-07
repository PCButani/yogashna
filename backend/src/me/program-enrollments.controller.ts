import { Body, Controller, Get, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import {
  CreateProgramEnrollmentDto,
  ProgramEnrollmentDto,
  ProgramEnrollmentListResponseDto,
} from './dto/program-enrollment.dto';

@Controller('me')
@UseGuards(FirebaseAuthGuard)
export class ProgramEnrollmentsController {
  constructor(private readonly programEnrollmentsService: ProgramEnrollmentsService) {}

  @Post('program-enrollments')
  async createEnrollment(
    @Request() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: CreateProgramEnrollmentDto,
  ): Promise<ProgramEnrollmentDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.programEnrollmentsService.createEnrollment(firebaseUid, body);
  }

  @Get('program-enrollments')
  async listEnrollments(@Request() req: any): Promise<ProgramEnrollmentListResponseDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.programEnrollmentsService.listEnrollments(firebaseUid);
  }
}
