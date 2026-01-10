import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { AuthModule } from '../auth/auth.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AuthModule, AssetsModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
