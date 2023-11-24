import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';
import { UpdateChatInput } from './dto/update.input';
import { AddChatInput } from './dto/addchat.input';
import { MessagesService } from '../Messages/messages.service';
import { Messages } from '../Messages/entities/messages.entity';
import { PubSub } from 'graphql-subscriptions';
import { BanItem } from './entities/ban.entity';
import { Mute } from './entities/mute.entity';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    ) {}

    @Mutation(() => Chat)
    async addChat(@Args('addChatInput') addChatInput: AddChatInput) {
      const chat = await this.chatsService.addChat(addChatInput);
      return chat;
    }

    @Mutation(() => Chat)
    updateChat(@Args('updateChatInput') updateChatInput: UpdateChatInput) {
      const chat = this.chatsService.update(updateChatInput.uuid, updateChatInput);
      return chat;
    }
  
    @Mutation(() => Chat)
    removeChat(@Args('uuid', { type: () => String }) uuid: string) {
      const chat = this.chatsService.remove(uuid);
      return chat;
    }

    @Mutation(() => Mute)
    toggleMute(
      @Args('uuid', { type: () => String }) uuid: string,
      @Args('userID', { type: () => String }) userID: string,
      @Args('duration', { type: () => Number }) duration: number,
    ) {
      return this.chatsService.toggleMute(uuid, userID, duration);
    }
  
  
    @Mutation(() => Chat)
    toggleAdmin(
      @Args('uuid', { type: () => String }) uuid: string,
      @Args('userID', { type: () => String }) userID: string,
    ) {
      return this.chatsService.toggleAdmin(uuid, userID);
    }

    @Mutation(() => BanItem)
    forcedOut(
      @Args('uuid', { type: () => String }) uuid: string,
      @Args('userID', { type: () => String }) userID: string,
      @Args('duration', { type: () => Number }) duration: number,
    ) {
      return this.chatsService.forcedOut(uuid, userID, duration);
    } 

    @Mutation(() => Chat)
    addToChat(
      @Args('uuid', { type: () => String }) uuid: string,
      @Args('userID', { type: () => String }) userID: string,
    ) {
      return this.chatsService.addUser(uuid, userID);
    } 



    @Query(() => [Chat], { name: 'chats' })
    findAll() {
      return this.chatsService.findAll();
    }

    @Query(() => Chat, { name: 'chats' })
    findOne(@Args('uuid', { type: () => String }) uuid: string) {
        return this.chatsService.findOne(uuid);
    }

    @Query(() => [Chat], { name: 'aliveChats' })
    findAliveChats(
      @Args('userID', { type: () => String, nullable: true }) userID: string,
      @Args('type', { type: () => String, nullable: true }) type: string,
    ) {
      return this.chatsService.findAvailableChats(userID, type);
    }
  
    @ResolveField(() => [Messages])
    getMessages(@Parent() chat: Chat) {
      return this.messagesService.getMessages(chat.uuid);
    }

    @ResolveField(() => [BanItem])
    getBan(@Parent() chat: Chat) {
      return this.chatsService.getBan(chat.uuid);
    }

    @ResolveField(() => [Mute])
    getMute(@Parent() chat: Chat) {
      return this.chatsService.getMute(chat.uuid);
    }
  
    @Query(() => Boolean, { name: 'checkChatPassword' })
    checkPassword(
      @Args('uuid', { type: () => String }) uuid: string,
      @Args('password', { type: () => String }) password: string,
    ) {
      return this.chatsService.checkPassword(uuid, password);
    }

}