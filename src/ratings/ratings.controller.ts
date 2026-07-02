import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';

@Controller('ratings')
export class RatingsController {
  constructor(
    private usersService: UsersService,
    private chatService: ChatService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async rateUser(@Req() req: any, @Body() body: { targetId: string; score: number; conversationId?: string }) {
    await this.usersService.addRating(body.targetId, body.score);
    if (body.conversationId) {
      await this.chatService.markRated(body.conversationId, req.user.id);
    }
    return { success: true };
  }
}
