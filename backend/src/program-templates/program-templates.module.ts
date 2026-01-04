import { Module } from '@nestjs/common';
import { ProgramTemplatesController } from './program-templates.controller';
import { ProgramTemplatesService } from './program-templates.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProgramTemplatesController],
  providers: [ProgramTemplatesService],
})
export class ProgramTemplatesModule {}
