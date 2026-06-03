import { Module } from '@nestjs/common';
import { KycController } from './infrastructure/controllers/kyc.controller';
import { ProcessIdentityCardUseCase } from './application/use-cases/process-identity-card.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [KycController],
  providers: [ProcessIdentityCardUseCase],
  exports: [ProcessIdentityCardUseCase],
})
export class KycModule {}
