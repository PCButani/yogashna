import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MeService } from './me.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CapabilitiesDto } from './dto/capabilities.dto';

@Controller('me')
@UseGuards(FirebaseAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('capabilities')
  async getCapabilities(@Request() req): Promise<CapabilitiesDto> {
    const firebaseUid = req.user.firebaseUid;
    return this.meService.getCapabilities(firebaseUid);
  }
}
