import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('avisos')
export class AvisosController {
  constructor(private avisosService: AvisosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.avisosService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { tipoServicio: string; descripcion: string }) {
    return this.avisosService.create({
      userId: req.user.id,
      userName: req.user.nombre || req.user.email,
      userRole: req.user.role,
      tipoServicio: body.tipoServicio,
      descripcion: body.descripcion.substring(0, 70), // Enforce 70 chars limit
    });
  }
}
