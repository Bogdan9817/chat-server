import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from 'src/message/message.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send_history')
  async getHistory() {
    const messages_history = await this.chatService.getHistory();
    this.server.emit('get_history', messages_history);
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() body: Message) {
    console.log('request received');
    const { response, error } = await this.chatService.sendRequest(body);
    if (error) {
      return this.server.emit('server_error', error);
    }
    this.server.emit('return_response', response);
    console.log('response sent');
  }
}
