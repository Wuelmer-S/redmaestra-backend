import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('ratings')
export class RatingsController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  rateUser(@Body() body: { targetId: string; score: number }) {
    return this.usersService.addRating(body.targetId, body.score);
  }
}
