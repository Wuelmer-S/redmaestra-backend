import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

type AuthenticatedRequest = Request & { user: JwtPayload };

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  createConversation(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateConversationDto,
  ) {
    return this.chatService.createConversation(request.user, body.targetUserId);
  }

  @Get('conversations')
  findMyConversations(@Req() request: AuthenticatedRequest) {
    return this.chatService.findMyConversations(request.user);
  }

  @Get('conversations/:id')
  findConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.findConversationForUser(id, request.user);
  }

  @Post('conversations/:id/messages')
  createMessage(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateMessageDto,
  ) {
    return this.chatService.createMessage(id, request.user, body.content);
  }

  @Get('conversations/:id/messages')
  findMessages(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.chatService.findMessages(id, request.user);
  }

  @Patch('conversations/:id/close')
  closeConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.closeConversation(id, request.user);
  }
}
