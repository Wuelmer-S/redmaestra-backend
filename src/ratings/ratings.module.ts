import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { UsersModule } from '../users/users.module';

import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  providers: [RatingsService],
  controllers: [RatingsController]
})
export class RatingsModule {}
