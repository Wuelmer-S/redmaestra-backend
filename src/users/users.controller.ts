import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Maestros')
@Controller('maestros')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
}
