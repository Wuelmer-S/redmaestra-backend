import { Controller, Post, Body, HttpCode, UseInterceptors, UploadedFiles, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ProcessIdentityCardUseCase } from '../kyc/application/use-cases/process-identity-card.use-case';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private processIdentityCardUseCase: ProcessIdentityCardUseCase,
    private usersService: UsersService
  ) {}

  @Post('login')
  @HttpCode(200) 
  @ApiBody({
    schema: {
      example: {
        email: 'admin@redmaestra.com',
        password: 'Admin1234',
      },
    },
  })
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiBody({
    schema: {
      example: {
        email: 'admin@redmaestra.com',
        password: 'Admin1234',
        role: 'cliente',
      },
    },
  })
  register(@Body() body: { email: string; password: string; role: string }) {
    // BLOQUEO DE SEGURIDAD: Ni clientes ni maestros pueden registrarse sin KYC
    const role = body.role || 'cliente';
    if (role === 'maestro' || role === 'cliente') {
        throw new UnauthorizedException('Todos los usuarios (clientes y maestros) deben registrarse a través del flujo de verificación KYC (/auth/register-with-kyc)');
    }
    return this.authService.register(body.email, body.password, role);
  }

  @Post('register-with-kyc')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'idCard', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]))
  async registerWithKyc(
    @UploadedFiles() files: { idCard?: any[], selfie?: any[] },
    @Body() body: any
  ) {
    if (!files || !files.idCard || !files.idCard[0] || !files.selfie || !files.selfie[0]) {
      throw new BadRequestException('Se requieren las imágenes del carnet (idCard) y la selfie (selfie)');
    }

    const { email, password, role, nombre, especialidad, run } = body;

    if (!email || !password || !run) {
        throw new BadRequestException('Faltan campos obligatorios (email, password, run)');
    }

    // 1. Verificaciones previas
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('El email ya está registrado');
    }

    const existingRun = await this.usersService.findByRun(run);
    if (existingRun) {
      throw new BadRequestException('El RUT ya está registrado en otra cuenta');
    }

    // 2. Verificación Facial (KYC)
    let kycResult;
    try {
      kycResult = await this.processIdentityCardUseCase.verifyFacialMatch(
        files.idCard[0].buffer,
        files.selfie[0].buffer
      );
    } catch (error) {
      throw new BadRequestException(`Fallo en la verificación facial: ${error.message}`);
    }

    if (!kycResult.success) {
        throw new BadRequestException('Verificación fallida. El rostro de la selfie no coincide con el del carnet.');
    }

    // 3. Creación del usuario SOLO si el KYC es verificado exitosamente
    const userExtraData = {
        nombre,
        especialidad,
        run,
        kycStatus: 'verified',
        kycData: kycResult
    };

    // Al llegar a este punto estamos 100% seguros que la cara coincide
    const user = await this.usersService.createUser(email, password, role || 'cliente', userExtraData);

    // 4. Retornar token (Login automático post registro)
    return this.authService.login(email, password);
  }
}
