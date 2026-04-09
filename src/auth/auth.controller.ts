import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
        role: 'admin',
      },
    },
  })
  register(@Body() body: { email: string; password: string; role: string }) {
    return this.authService.register(body.email, body.password, body.role);
  }
}