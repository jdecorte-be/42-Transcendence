import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './users.entity';
import {
  MatchHistoryDto,
  ProfileDto,
  SignDto,
  UserIdDto,
  UserRelationDto,
  UserResponseDto,
  loginDto,
  FriendDto,
} from 'src/users/users.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'graceful-fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp42(login: string, imageUrl: string): Promise<any | null> {
    //console.log(`users.service: signUp(${user.login})`);
    console.log('|', imageUrl, '|');
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    const reqBody = {
      login: login,
      avatar: Buffer.from(response.data, 'binary'),
      is42: true,
    };
    const newUser = await this.userRepository.save(reqBody).catch((err) => {
      return [err.detail, err.code];
    });
    if (newUser) {
      return newUser;
    }
    return null;
  }

  async displayAll() {
    //console.log(`users.service: displayAll(userRepository)`);
    return await this.userRepository.find().catch((err) => {
      console.log(err);
    });
  }

  async clear() {
    //console.log(`users.service: clear(userRepository)`);
    return await this.userRepository.clear();
  }

  async getByName(login: string) {
    return await this.userRepository.findOneBy({ login });
  }

  async getByLogin(login: string) {
    return this.userRepository
      .findOneOrFail({
        where: {
          login: login,
        },
      })
      .catch(() => {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      });
  }
  async getByPseudo(pseudo: string) {
    return this.userRepository
      .findOneOrFail({
        where: {
          pseudo: pseudo,
        },
      })
      .catch(() => {
        throw new HttpException(
          { message: 'Input data validation failed' },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  getUserRepository() {
    return this.userRepository;
  }

  async uploadFile(
    id: number,
    buffer: Buffer,
    filename: string,
  ): Promise<UserIdDto | null> {
    //console.log(`users.service: uploadFile(${id} -> ${filename})`);
    const user = await this.getById(id);
    if (user) {
      user.filename = filename;
      user.avatar = buffer;
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return {
        id: user.id,
      };
    }
    return null;
  }

  async getById(id: number): Promise<User | null> {
    //console.log(`users.service: getByid(${id})`);
    if (typeof id !== 'number' || isNaN(id)) {
      console.log(typeof id);
      return null;
    }
    const user = await this.userRepository.findOneBy({ id }).catch((err) => {
      console.log(err);
      return err;
    });
    if (user) return user;
    return null;
  }

  async signUp(user: SignDto): Promise<any | null> {
    //console.log(`users.service: signUp(${user.login})`);
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(user.password, salt);
    const reqBody = {
      login: user.login,
      _password: hash,
      phoneNumber: user.phoneNumber,
      avatar: readFileSync(path.resolve('src/users/default.jpg')),
    };
    const newUser = await this.userRepository.save(reqBody).catch((err) => {
      return [err.detail, err.code];
    });
    if (newUser) {
      return newUser;
    }
    return null;
  }

  async signIn(user: loginDto): Promise<UserResponseDto | null> {
    //console.log(`users.service: signIn(${user.login})`);
    const { login } = user;
    const foundUser = await this.userRepository.findOneBy({ login });
    if (foundUser) {
      const { password } = foundUser;
      const result = bcrypt.compareSync(user.password, password);
      if (result) {
        foundUser.status = 'online';
        await this.userRepository.save(foundUser).catch((err) => {
          return err;
        });
        return {
          id: foundUser.id,
          login: foundUser.login,
          status: foundUser.status,
          has2fa: foundUser.has2fa,
          phoneNumber: foundUser.phoneNumber,
        };
      }
    }
    return null;
  }

  async blockUser(data: UserRelationDto): Promise<UserResponseDto | null> {
    //console.log(`users.service: blockUser(${data.target})`);
    const user = await this.getById(data.id);
    if (user) {
      if (!user.blackList) user.blackList = [];
      if (!user.blackList.includes(data.target))
        user.blackList.push(data.target);
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return {
        id: user.id,
        login: user.login,
        status: user.status,
        has2fa: user.has2fa,
        phoneNumber: user.phoneNumber,
      };
    }
    return null;
  }

  async addToMatchHistory(
    UserLogin: string,
    matchData: MatchHistoryDto,
  ): Promise<User | null> {
    console.log(`users.service: addToMatchHistory(${UserLogin})`);
    const user = await this.getByLogin(UserLogin);
    if (user) {
      console.log(matchData);
      const newItem = new MatchHistoryDto();
      newItem.date = matchData.date;
      newItem.Winner = matchData.Winner;
      newItem.Loser = matchData.Loser;
      newItem.scoreX = matchData.scoreX;
      newItem.scoreY = matchData.scoreY;
      if (!user.matchHistory) user.matchHistory = [];
      user.matchHistory.push(newItem);
      if (matchData.Winner === UserLogin) user.nVictories++;
      else user.nDefeats++;
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return user;
    }
    return null;
  }

  async getMatchHistory(
    userData: UserIdDto,
  ): Promise<(MatchHistoryDto[] | null)[][] | null> {
    //console.log(`users.service: getMatchHistory(${userData.id})`);
    const user = await this.getById(userData.id);
    if (user) {
      user.matchHistory.map((match) => {
        return [
          match.date,
          match.Winner,
          match.Loser,
          match.scoreX,
          match.scoreY,
        ];
      });
    }
    return null;
  }

  async getLeaderboard(): Promise<(string | number)[][] | null> {
    const users = this.userRepository.find();
    if (users) {
      const sortedUsers = (await users).sort(
        (a, b) => b.nVictories - a.nVictories,
      );
      const leaderBoard = sortedUsers.map((user, index) => {
        return [user.login, user.nVictories, index + 1, user.nDefeats];
      });
      if (leaderBoard) return leaderBoard;
    }

    return null;
  }

  async getProfile(userData: UserIdDto): Promise<ProfileDto | null> {
    const user = await this.getById(userData.id);
    if (user) {
      return {
        login: user.login,
        avatar: user.avatar,
        status: user.status,
      };
    }
    return null;
  }

  async updateLogin(user: User, newLogin: string): Promise<any> {
    if (user) {
      user.login = newLogin;
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return user;
    }
    return null;
  }

  async updateStatus(login: string, newStatus: string): Promise<any> {
    if (!login)
      return null;
    try {
      const user = await this.getByLogin(login);
      if (user) {
        console.log(user.login + ' ' + newStatus);
        user.status = newStatus;
        await this.userRepository.save(user).catch((err) => {
          return err;
        });
        return user;
      }
      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async blockByLogin(from: string, login: string) {
    const user = await this.getByLogin(from);
    user.blackList = user.blackList.includes(login)
      ? user.blackList.filter((item) => item !== login)
      : [...user.blackList, login];
    return await User.save(user);
  }

  async invite(id: number, target: string): Promise<User | null> {
    const src = await this.getById(id);
    const dst = await this.getByLogin(target);
    if (src && dst) {
      if (dst.inviteList.includes(src.login) === false) {
        dst.inviteList.push(src.login);
        await this.userRepository.save(dst).catch((err) => {
          return err;
        });
        return dst;
      }
    }
    return null;
  }

  async accept(id: number, target: string): Promise<User | null> {
    const src = await this.getById(id);
    const dst = await this.getByLogin(target);
    if (src && dst) {
      if (src.inviteList.includes(dst.login)) {
        src.inviteList = src.inviteList.filter((item) => item !== dst.login);
        src.friendList.push(dst.login);
        dst.friendList.push(src.login);
        await this.userRepository.save(src).catch((err) => {
          return err;
        });
        await this.userRepository.save(dst).catch((err) => {
          return err;
        });
        return src;
      }
    }
    return null;
  }

  async decline(id: number, target: string): Promise<User | null> {
    const src = await this.getById(id);
    const dst = await this.getByLogin(target);
    if (src && dst) {
      if (src.inviteList.includes(dst.login)) {
        src.inviteList = src.inviteList.filter((item) => item !== dst.login);
        await this.userRepository.save(src).catch((err) => {
          return err;
        });
        return src;
      }
    }
    return null;
  }

  async remove(id: number, target: string): Promise<User | null> {
    const src = await this.getById(id);
    const dst = await this.getByLogin(target);
    if (src && dst) {
      src.friendList = src.friendList.filter((item) => item !== dst.login);
      dst.friendList = dst.friendList.filter((item) => item !== src.login);
      await this.userRepository.save(src).catch((err) => {
        return err;
      });
      await this.userRepository.save(dst).catch((err) => {
        return err;
      });
      return src;
    }
    return null;
  }

  async pending(id: number): Promise<FriendDto[] | null> {
    const user = await this.getById(id);
    if (user) {
      const invited = await this.userRepository.find({
        where: {
          login: In(user.inviteList),
        },
      });
      const invitelist = invited.map((invite) => {
        return {
          id: invite.id,
          avatar: Buffer.from(invite.avatar).toString('base64'),
          login: invite.login,
          status: invite.status,
          pseudo: invite.pseudo,
        };
      });
      return invitelist;
    }
    return null;
  }

  async getFriends(id: number): Promise<FriendDto[] | null> {
    const user = await this.getById(id);
    if (user) {
      const userFriends = await this.userRepository.find({
        where: {
          login: In(user.friendList),
        },
      });
      const friendlist = userFriends.map((friend) => {
        return {
          id: friend.id,
          avatar: Buffer.from(friend.avatar).toString('base64'),
          login: friend.login,
          status: friend.status,
          pseudo: friend.pseudo,
        };
      });
      return friendlist;
    }
    return null;
  }

  async switch2fa(id: number): Promise<User | null> {
    const user = await this.getById(id);
    if (user) {
      if (user.has2fa === false) {
        user.has2fa = true;
        console.log(`usersService.switch2fa(true) -> ${id}`);
      } else {
        user.has2fa = false;
        console.log(`usersService.switch2fa(false) -> ${id}`);
      }
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return user;
    }
    return null;
  }

  async set2fa(id: number, code: string): Promise<User | null> {
    const user = await this.getById(id);
    if (user) {
      user.code2fa = code;
      await this.userRepository.save(user).catch((err) => {
        return err;
      });
      return user;
    }
    return null;
  }

  async validate2fa(id: number, code: string): Promise<boolean> {
    const user = await this.getById(id);
    if (user) {
      if (user.code2fa.localeCompare(code) === 0) return true;
    }
    return false;
  }
}
