import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async saveMessage(message: Message) {
    await this.messageRepo.insert(message);
  }

  getHistory(): Promise<Message[]> {
    return this.messageRepo.find();
  }
}
