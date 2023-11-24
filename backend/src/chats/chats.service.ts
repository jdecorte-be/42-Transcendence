import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { IsUUID, validate } from 'class-validator';
import { AddChatInput } from './dto/addchat.input';
import { UpdateChatInput } from './dto/update.input';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';
import { BanItem } from './entities/ban.entity';
import * as moment from "moment";
import { Mute } from './entities/mute.entity';

@Injectable()
export class ChatsService {

    private checkValidName(name: string) {
        if (name.search(/[^a-zA-Z0-9]/g) !== -1 || name.trim() === '') {
            const error = { password: `Chat name need to be in english` }
            throw new HttpException({ message: 'Input data validation failed', error }, HttpStatus.BAD_REQUEST);
        }
    }


    async addChat(addChatInput: AddChatInput) {
        const chat = new Chat();
        chat.name = addChatInput.name;
        chat.password = addChatInput.password;
        chat.type = addChatInput.type;
        chat.ownerID = addChatInput.ownerID;
        chat.userID = addChatInput.userID;
        this.checkValidName(chat.name);

        const err = await validate(chat);
        if (err.length > 0)
            throw new HttpException({ message: 'Input data validation failed' }, HttpStatus.BAD_REQUEST);
        else
            return await Chat.save(chat);
    }

    async findAll() {
        return Chat.find();
    }

    async findOne(uuid: string) {
        return Chat.findOneOrFail({
            where: {
                uuid: uuid,
            }
        }).catch(() => {
            throw new HttpException({ message: 'Input data validation failed' }, HttpStatus.BAD_REQUEST);
        });
    }

    async update(uuid: string, upInput: UpdateChatInput) {
        const chat = await this.findOne(uuid);

        chat.name = upInput.name !== undefined ? upInput.name : chat.name;
        chat.isAlive = upInput.isAlive !== undefined ? upInput.isAlive : chat.isAlive;
        chat.adminID = upInput.adminID ? upInput.adminID : chat.adminID;
        chat.userID = upInput.userID ? upInput.userID : chat.userID;
        chat.muteID = upInput.muteID ? upInput.muteID : chat.muteID;
        chat.type = upInput.type ? upInput.type : chat.type;
        chat.password = upInput.password  ? await bcrypt.hash(upInput.password, 10) : "";

        const err = await validate(chat);
        if (err.length > 0)
            throw new HttpException({ message: 'Input data validation failed' }, HttpStatus.BAD_REQUEST);
        else
            return await Chat.save(chat);
    }

    async remove(uuid: string) {
        const chat = await this.findOne(uuid);
        return await Chat.remove(chat);
    }

    async findAvailableChats(userID: string, type: string) {
        const chatList = await Chat.getRepository()
            .createQueryBuilder()
            .where('"isAlive" = true')
            .orderBy('"createdAt"')
            .getMany();
        return chatList;
    }

    async checkPassword(uuid: string, password: string) {
        const chat = await this.findOne(uuid);
        return await bcrypt.compare(password, chat.password);
    }

    private async checkUserExistInChat(uuid: string, userID: string) {
        const chat = await Chat.findOneOrFail({
            where: {
                uuid: uuid,
            },
        }).catch(() => {
            const error = { uuid: `chat with uuid(${uuid}) does not exist` };
            throw new HttpException({ message: 'Input data validation failed', error }, HttpStatus.BAD_REQUEST);
        });
        const user = await User.findOneOrFail({
            where: {
                login: userID,
            },
        }).catch(() => {
            const error = { uuid: `userID(${userID}) does not exist` };
            throw new HttpException({ message: 'Input data validation failed', error }, HttpStatus.BAD_REQUEST);
        });
        return { chat: chat, user: user };
    }


    //admin
    async toggleAdmin(uuid: string, userID: string) {
        const obj = await this.checkUserExistInChat(uuid, userID);
        obj.chat.adminID = obj.chat.adminID.includes(obj.user.login)
            ? obj.chat.adminID.filter((item) => item !== obj.user.login)
            : [...obj.chat.adminID, obj.user.login];
        return await Chat.save(obj.chat);
    }

    //mute, unmute
    async toggleMute(uuid: string, userID: string, duration: number) {
        console.log("dfdfdsfs");
        const isMute = await Mute.find({
            where: {
                chatUUID: uuid,
                login: userID
            }
        });
        if (isMute.length !== 0) {
            const removedMute = await Mute.createQueryBuilder()
                .delete()
                .from(Mute)
                .where("chatUUID= :uuid", { uuid: uuid })
                .andWhere("login= :userID", { userID: userID })
                .execute();
            return await removedMute.raw;
        }
        const newMute = new Mute();
        newMute.login = userID;
        newMute.mutedUntil = moment().add(duration, 'minutes').toDate();
        newMute.chatUUID = uuid;
        return await Mute.save(newMute);
    }

    async forcedOut(uuid: string, userID: string, duration: number) {
        const isBan = await BanItem.find({
            where: {
                chatUUID: uuid,
                login: userID
            }
        });
        if (isBan.length !== 0) {
            const removedBan = await BanItem.createQueryBuilder()
                .delete()
                .from(BanItem)
                .where("chatUUID= :uuid", { uuid: uuid })
                .andWhere("login= :userID", { userID: userID })
                .execute();
            return await removedBan.raw;
        }
        const newBan = new BanItem();
        newBan.login = userID;
        newBan.bannedUntil = moment().add(duration, 'minutes').toDate();
        newBan.chatUUID = uuid;
        return await BanItem.save(newBan);
    }

    async addUser(uuid: string, userID: string) {
        const chat = await this.findOne(uuid);

        chat.userID = chat.userID.includes(userID)
            ? chat.userID
            : [...chat.userID, userID];
        return await Chat.save(chat);
    }

    async getBan(uuid: string) {
        const banList = await BanItem.find({
            where: {
                chatUUID: uuid,
            },
            order: {
                bannedUntil: 'DESC',
            },
        });
        return banList;
    }

    async getMute(uuid: string) {
        const muteList = await Mute.find({
            where: {
                chatUUID: uuid,
            },
            order: {
                mutedUntil: 'DESC',
            },
        });
        return muteList;
    }

}