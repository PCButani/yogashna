import { Module } from '@nestjs/common';
import { ProgramTemplatesV1Controller } from './program-templates-v1.controller';
import { ProgramTemplatesV1Service } from './program-templates-v1.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AssetsModule],
  controllers: [ProgramTemplatesV1Controller],
  providers: [ProgramTemplatesV1Service],
})
export class ProgramTemplatesV1Module {}
