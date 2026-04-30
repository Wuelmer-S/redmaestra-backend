import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('Location')
@Controller('ubicacion')
export class LocationController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiBody({
    schema: {
      example: {
        userId: '84d6f367-b1f7-4044-ac64-f5058a1ea80c',
        latitud: -33.4569,
        longitud: -70.6483,
      },
    },
  })
  updateUbicacion(
    @Body() body: { userId: string; latitud: number; longitud: number },
  ) {
    return this.usersService.updateUbicacion(
      body.userId,
      body.latitud,
      body.longitud,
    );
  }
}