import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aviso } from './aviso.entity';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aviso]), UsersModule],
  providers: [AvisosService],
  controllers: [AvisosController]
})
export class AvisosModule {}
