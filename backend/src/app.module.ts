import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProgramTemplatesModule } from './program-templates/program-templates.module';
import { ProgramTemplatesV1Module } from './program-templates-v1/program-templates-v1.module';
import { VideosModule } from './videos/videos.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { VideoAssetsModule } from './video-assets/video-assets.module';
import { MeModule } from './me/me.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    AuthModule,
    DatabaseModule,
    HealthModule,
    ProgramTemplatesModule,
    ProgramTemplatesV1Module,
    VideosModule,
    UserProfileModule,
    VideoAssetsModule,
    MeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
