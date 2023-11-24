import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { PubSub } from 'graphql-subscriptions';
@Module({
  imports: [],
  providers: [MessagesService, MessagesResolver, PubSub,],
})
export class MessagesModule {}

