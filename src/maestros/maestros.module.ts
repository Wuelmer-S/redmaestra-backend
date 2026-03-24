import { Module } from '@nestjs/common';
import { MaestrosService } from './maestros.service';
import { MaestrosController } from './maestros.controller';

@Module({
  providers: [MaestrosService],
  controllers: [MaestrosController]
})
export class MaestrosModule {}
