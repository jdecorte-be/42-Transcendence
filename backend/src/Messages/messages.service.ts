import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IsUUID, validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';
import { AddMessageInput } from './dto/addmessage.input';
import { Messages } from './entities/messages.entity';
import { Chat } from 'src/chats/entities/chat.entity';

@Injectable()
export class MessagesService {


    async addMessage(addMessageInput : AddMessageInput) {
        const chat = await Chat.findOneOrFail({
              where: {
                uuid: addMessageInput.chatUUID,
                isAlive: true,
              },
            }).catch(() => {
              throw new HttpException({ message: 'Input data validation failed' }, HttpStatus.BAD_REQUEST);
        });

        if(chat.muteID.includes(addMessageInput.userID)) // mute  user
            throw new HttpException({ message: 'Input data validation failed' }, HttpStatus.BAD_REQUEST); 

        const messages = new Messages();
        messages.chatUUID = chat.uuid;
        messages.message = addMessageInput.message;
        messages.userID = addMessageInput.userID;
        return await Messages.save(messages);
    }

    async getMessages(uuid : string) {
        const chatLogs = await Messages.find({
            where: {
              chatUUID: uuid,
            },
            order: {
              createdAt: 'ASC',
            },
          });
          return chatLogs;
    }

    async findAll() {
        return Messages.find();
    }


}