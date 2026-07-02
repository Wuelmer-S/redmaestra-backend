import { Controller, Get, Query, Patch, Body, UseGuards, Req, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Maestros')
@Controller('maestros')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMaestros() {
    return this.usersService.findMaestros();
  }

  @Get('cercanos')
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radio', type: Number, required: false })
  getMaestrosCercanos(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radio') radio = '10',
  ) {
    return this.usersService.findMaestrosCercanos(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radio),
    );
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() body: { descripcion?: string; especialidad?: string; nombre?: string }) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Post('kyc/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  verifyKyc(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.verifyKyc(req.user.id, file);
  }
}
