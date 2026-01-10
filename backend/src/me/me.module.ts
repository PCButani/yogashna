import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { AuthModule } from '../auth/auth.module';
import { AbhyasaCycleController } from './abhyasa-cycle.controller';
import { AbhyasaCycleService } from './abhyasa-cycle.service';
import { SubscriptionPolicyService } from './subscription-policy.service';
import { ProgramEnrollmentsController } from './program-enrollments.controller';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import { PlaylistSelectionService } from '../common/playlist/playlist-selection.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AuthModule, AssetsModule],
  controllers: [MeController, AbhyasaCycleController, ProgramEnrollmentsController],
  providers: [
    MeService,
    AbhyasaCycleService,
    SubscriptionPolicyService,
    ProgramEnrollmentsService,
    PlaylistSelectionService,
  ],
})
export class MeModule {}
