import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MaestrosModule } from './maestros/maestros.module';
import { RatingsModule } from './ratings/ratings.module';
import { LocationController } from './location/location.controller';
import { LocationService } from './location/location.service';
import { LocationModule } from './location/location.module';

@Module({
  imports: [AuthModule, UsersModule, MaestrosModule, RatingsModule, LocationModule],
  controllers: [AppController, LocationController],
  providers: [AppService, LocationService],
})
export class AppModule {}
