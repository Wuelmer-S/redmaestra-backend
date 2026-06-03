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
  ) {}

  async createConversation(currentUser: JwtPayload, maestroId: string) {
    if (currentUser.role !== 'cliente') {
      throw new ForbiddenException('Solo los clientes pueden iniciar conversaciones');
    }

    if (!maestroId) {
      throw new BadRequestException('El maestroId es obligatorio');
    }

    const maestro = await this.usersService.findById(maestroId);
    if (!maestro || maestro.role !== 'maestro') {
      throw new BadRequestException('El destinatario debe ser un maestro');
    }

    const existing = await this.conversationsRepository.findOne({
      where: {
        clienteId: currentUser.sub,
        maestroId,
        status: 'active',
      },
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationsRepository.create({
      clienteId: currentUser.sub,
      maestroId,
      createdById: currentUser.sub,
      status: 'active',
    });

    return this.conversationsRepository.save(conversation);
  }

  async findMyConversations(currentUser: JwtPayload) {
    const where =
      currentUser.role === 'maestro'
        ? { maestroId: currentUser.sub }
        : { clienteId: currentUser.sub };

    const conversations = await this.conversationsRepository.find({
      where,
      relations: ['cliente', 'maestro'],
      order: { updatedAt: 'DESC' },
    });

    return conversations.map((conversation) =>
      this.toConversationResponse(conversation),
    );
  }

  async findConversationForUser(id: string, currentUser: JwtPayload) {
    const conversation = await this.getConversationEntityForUser(id, currentUser);
    return this.toConversationResponse(conversation);
  }

  private async getConversationEntityForUser(id: string, currentUser: JwtPayload) {
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
    currentUser: JwtPayload,
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
      senderId: currentUser.sub,
      content: content.trim(),
    });

    const saved = await this.messagesRepository.save(message);
    await this.conversationsRepository.update(conversation.id, {
      updatedAt: new Date(),
    });

    return saved;
  }

  async findMessages(conversationId: string, currentUser: JwtPayload) {
    await this.getConversationEntityForUser(conversationId, currentUser);

    const messages = await this.messagesRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.toMessageResponse(message));
  }

  async closeConversation(id: string, currentUser: JwtPayload) {
    const conversation = await this.getConversationEntityForUser(id, currentUser);

    await this.conversationsRepository.update(id, { status: 'closed' });
    return this.toConversationResponse({
      ...conversation,
      status: 'closed',
    });
  }

  private ensureParticipant(conversation: Conversation, currentUser: JwtPayload) {
    const isParticipant =
      conversation.clienteId === currentUser.sub ||
      conversation.maestroId === currentUser.sub;

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
