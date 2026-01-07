import { Module } from '@nestjs/common';
import { ProgramTemplatesController } from './program-templates.controller';
import { ProgramTemplatesService } from './program-templates.service';
import { AuthModule } from '../auth/auth.module';
import { PlaylistSelectionService } from '../common/playlist/playlist-selection.service';

@Module({
  imports: [AuthModule],
  controllers: [ProgramTemplatesController],
  providers: [ProgramTemplatesService, PlaylistSelectionService],
})
export class ProgramTemplatesModule {}
