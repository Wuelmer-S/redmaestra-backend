import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      await this.avisosService.delete(id, req.user.id);
      return { success: true };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
