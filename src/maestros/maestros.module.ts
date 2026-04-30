import { Module } from '@nestjs/common';
import { MaestrosController } from './maestros.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MaestrosController],
})
export class MaestrosModule {}