import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [LocationController],
})
export class LocationModule {}