import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('me')
@UseGuards(FirebaseAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getMyProfile(@Req() req: any): Promise<UserProfileResponseDto> {
    const { firebaseUid, phoneNumber } = req.user;
    return this.userProfileService.getProfile(firebaseUid, phoneNumber);
  }

  @Patch()
  async updateMyProfile(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const { firebaseUid, phoneNumber } = req.user;
    return this.userProfileService.updateProfile(
      firebaseUid,
      phoneNumber,
      updateDto,
    );
  }
}
