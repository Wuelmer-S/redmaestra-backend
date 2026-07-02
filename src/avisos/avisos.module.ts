import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aviso } from './aviso.entity';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aviso])],
  providers: [AvisosService],
  controllers: [AvisosController]
})
export class AvisosModule {}
