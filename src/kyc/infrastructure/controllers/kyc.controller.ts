import { Controller, Post, UseInterceptors, UploadedFiles, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProcessIdentityCardUseCase } from '../../application/use-cases/process-identity-card.use-case';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller('api/v1/kyc')
export class KycController {
  constructor(private readonly processIdentityCardUseCase: ProcessIdentityCardUseCase) {}

  @Post('verify-identity')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'idCard', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]))
  async verifyIdentity(@UploadedFiles() files: { idCard?: any[], selfie?: any[] }, @Request() req: any) {
    if (!files || !files.idCard || !files.idCard[0] || !files.selfie || !files.selfie[0]) {
      throw new BadRequestException('Se requieren las imágenes del carnet (idCard) y la selfie (selfie)');
    }

    try {
      const result = await this.processIdentityCardUseCase.execute(
        files.idCard[0].buffer,
        files.selfie[0].buffer,
        req.user.id
      );
      return result;
    } catch (error) {
      console.error('Error verifying identity:', error);
      throw new BadRequestException(error.message || 'Failed to verify identity');
    }
  }
}
