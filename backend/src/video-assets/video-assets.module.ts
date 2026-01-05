import { Module } from '@nestjs/common';
import { VideoAssetsController } from './video-assets.controller';
import { VideoAssetsService } from './video-assets.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AssetsModule],
  controllers: [VideoAssetsController],
  providers: [VideoAssetsService],
})
export class VideoAssetsModule {}
