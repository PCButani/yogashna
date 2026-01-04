import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProgramTemplatesModule } from './program-templates/program-templates.module';
import { VideosModule } from './videos/videos.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    HealthModule,
    ProgramTemplatesModule,
    VideosModule,
    UserProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
