import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { MessageController } from './message.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  exports: [MessageService],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
