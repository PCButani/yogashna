import { Module } from '@nestjs/common';
import { ProgramTemplatesController } from './program-templates.controller';
import { ProgramTemplatesService } from './program-templates.service';

@Module({
  controllers: [ProgramTemplatesController],
  providers: [ProgramTemplatesService],
})
export class ProgramTemplatesModule {}
