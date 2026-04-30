import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('Maestros')
@Controller('maestros')
export class MaestrosController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMaestros() {
    return this.usersService.findMaestros();
  }

  @Get('cercanos')
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radio', required: false, type: Number })
  getMaestrosCercanos(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radio') radio: number = 5,
  ) {
    return this.usersService.findMaestrosCercanos(
      Number(lat),
      Number(lng),
      Number(radio),
    );
  }

  @Get(':id')
  getMaestroById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}