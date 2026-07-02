import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
    private chatGateway: ChatGateway,
  ) {}

  async createConversation(currentUser: any, targetUserId: string) {
    if (!targetUserId) {
      throw new BadRequestException('El targetUserId es obligatorio');
    }

    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) {
      throw new BadRequestException('El usuario destinatario no existe');
    }

    if (currentUser.role === targetUser.role) {
      throw new ForbiddenException('No puedes iniciar una conversación con un usuario de tu mismo rol');
    }

    const clienteId = currentUser.role === 'cliente' ? currentUser.id : targetUserId;
    const maestroId = currentUser.role === 'maestro' ? currentUser.id : targetUserId;

    const existing = await this.conversationsRepository.findOne({
      where: {
        clienteId,
        maestroId,
        status: 'active',
      },
    });

    if (existing) {
      return existing;
    }

    const conversation = new Conversation();
    conversation.clienteId = clienteId;
    conversation.maestroId = maestroId;
    conversation.createdById = currentUser.id;
    conversation.status = 'active';

    const saved = await this.conversationsRepository.save(conversation);
    
    // 🐴 ponytail: notify immediately to avoid requiring refresh
    saved.cliente = currentUser.role === 'cliente' ? currentUser : targetUser;
    saved.maestro = currentUser.role === 'maestro' ? currentUser : targetUser;
    this.chatGateway.notifyConversationUpdated(targetUserId, this.toConversationResponse(saved));
    
    return saved;
  }

  async findMyConversations(currentUser: any) {
    const where =
      currentUser.role === 'maestro'
        ? { maestroId: currentUser.id }
        : { clienteId: currentUser.id };

    const conversations = await this.conversationsRepository.find({
      where,
      relations: ['cliente', 'maestro'],
      order: { updatedAt: 'DESC' },
    });

    return conversations.map((conversation) =>
      this.toConversationResponse(conversation),
    );
  }

  async findConversationForUser(id: string, currentUser: any) {
    const conversation = await this.getConversationEntityForUser(id, currentUser);
    return this.toConversationResponse(conversation);
  }

  private async getConversationEntityForUser(id: string, currentUser: any) {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['cliente', 'maestro'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    this.ensureParticipant(conversation, currentUser);
    return conversation;
  }

  async createMessage(
    conversationId: string,
    currentUser: any,
    content: string,
  ) {
    const conversation = await this.getConversationEntityForUser(
      conversationId,
      currentUser,
    );

    if (conversation.status !== 'active') {
      throw new BadRequestException('La conversacion esta cerrada');
    }

    if (!content || !content.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacio');
    }

    const message = this.messagesRepository.create({
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: content.trim(),
    });

    const saved = await this.messagesRepository.save(message);
    await this.conversationsRepository.update(conversation.id, {
      updatedAt: new Date(),
    });

    // 🐴 ponytail: real-time notification
    saved.sender = currentUser;
    const formatted = this.toMessageResponse(saved);
    const otherUserId = conversation.clienteId === currentUser.id ? conversation.maestroId : conversation.clienteId;
    this.chatGateway.notifyNewMessage(otherUserId, formatted);

    return formatted;
  }

  async findMessages(conversationId: string, currentUser: any) {
    await this.getConversationEntityForUser(conversationId, currentUser);

    const messages = await this.messagesRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.toMessageResponse(message));
  }

  async closeConversation(id: string, currentUser: any) {
    const conversation = await this.getConversationEntityForUser(id, currentUser);

    await this.conversationsRepository.update(id, { status: 'closed' });
    const updated = this.toConversationResponse({
      ...conversation,
      status: 'closed',
    });
    const otherUserId =
      conversation.clienteId === currentUser.id
        ? conversation.maestroId
        : conversation.clienteId;
    this.chatGateway.notifyConversationUpdated(otherUserId, updated);
    this.chatGateway.notifyConversationUpdated(currentUser.id, updated);
    return updated;
  }

  private ensureParticipant(conversation: Conversation, currentUser: any) {
    const isParticipant =
      conversation.clienteId === currentUser.id ||
      conversation.maestroId === currentUser.id;

    if (!isParticipant) {
      throw new ForbiddenException('No perteneces a esta conversacion');
    }
  }

  private toPublicUser(user?: { id: string; email: string; role: string; nombre: string | null }) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
    };
  }

  private toConversationResponse(conversation: Conversation) {
    return {
      id: conversation.id,
      clienteId: conversation.clienteId,
      maestroId: conversation.maestroId,
      createdById: conversation.createdById,
      status: conversation.status,
      cliente: this.toPublicUser(conversation.cliente),
      maestro: this.toPublicUser(conversation.maestro),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private toMessageResponse(message: Message) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      readAt: message.readAt,
      sender: this.toPublicUser(message.sender),
      createdAt: message.createdAt,
    };
  }
}
