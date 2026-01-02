import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProgramTemplatesModule } from './program-templates/program-templates.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [DatabaseModule, HealthModule, ProgramTemplatesModule, VideosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
