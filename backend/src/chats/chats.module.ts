import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsResolver } from './chats.resolver';
import { MessagesService } from '../Messages/messages.service';

@Module({
  imports: [],
  providers: [ChatsService, MessagesService,ChatsResolver],
})
export class ChatsModule {}