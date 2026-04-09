import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('Maestros')
@Controller('maestros')
export class MaestrosController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMaestros() {
    return this.usersService.findMaestros();
  }
}