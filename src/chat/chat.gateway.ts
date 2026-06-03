import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ path: '/chat-ws' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, WebSocket[]>();

  constructor(private configService: ConfigService) {}

  handleConnection(client: WebSocket, ...args: any[]) {
    try {
      const request = args[0];
      const url = new URL(request.url, 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        client.close(1008, 'Token required');
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'secretKey';
      const decoded = jwt.verify(token, secret) as any;
      const userId = decoded.sub;

      if (!this.clients.has(userId)) {
        this.clients.set(userId, []);
      }
      this.clients.get(userId)?.push(client);
    } catch (error) {
      client.close(1008, 'Invalid token');
    }
  }

  handleDisconnect(client: WebSocket) {
    for (const [userId, sockets] of this.clients.entries()) {
      const index = sockets.indexOf(client);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.clients.delete(userId);
        }
        break;
      }
    }
  }

  notifyNewMessage(userId: string, message: any) {
    const sockets = this.clients.get(userId);
    if (sockets) {
      const data = JSON.stringify({ type: 'NEW_MESSAGE', payload: message });
      sockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  }

  notifyConversationUpdated(userId: string, conversation: any) {
    const sockets = this.clients.get(userId);
    if (sockets) {
      const data = JSON.stringify({ type: 'CONVERSATION_UPDATED', payload: conversation });
      sockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  }
}
