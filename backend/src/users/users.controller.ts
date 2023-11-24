import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  Req,
  Res,
  Param,
} from '@nestjs/common';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
const storage = multer.memoryStorage();

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('display')
  displayAll() {
    return this.usersService.displayAll();
  }

  @Get('clear')
  clear() {
    return this.usersService.clear();
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async getFile(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    console.log(`users.controller: getFile()`);
    if (req.file && req.body.user) {
      if (!['image/png', 'image/jpeg'].includes(req.file?.mimetype)) {
        return res
          .status(415)
          .send([
            'The file type is not supported by the server. (png/jpeg/jpg only).',
          ]);
      }
      if (req.file?.size > 100000) {
        return res
          .status(413)
          .send([
            'The file size exceeds the maximum allowed size specified by the server. (100ko).',
          ]);
      }
      let id = parseInt(req.body.user)
      const user = await this.usersService.getById(id);
      await this.usersService.uploadFile(
        id,
        req.file?.buffer,
        req.file?.originalname,
      );
      if (user) {
        const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
        console.log('Here');
        return res.status(200).send({
          avatar: base64EncodedAvatar,
          login: user.login,
          status: user.status,
          pseudo: user.pseudo,
        });
      }
      return res
        .status(400)
        .send(['Invalid request. Please choose a different file']);
    }
  }

  @Post('profile')
  async getProfile(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const user = await this.usersService.getById(req.body.id);
    if (user) {
      if (req.body.login) {
        const check = req.body.login as string;
        if (check.length < 4 || check.length > 15) {
          return res
            .status(400)
            .send(['Login should be between 4 and 15 characters long.']);
        }
        await this.usersService.updateLogin(user, req.body.login);
      }
      const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
      return res.status(200).send({
        avatar: base64EncodedAvatar,
        login: user.login,
        status: user.status,
        pseudo: user.pseudo,
      });
    }
  }

  @Get('profile/:id')
  async initProfile(@Param('id') id: number, @Res() res: ExpressResponse) {
    const user = await this.usersService.getById(id);
    if (user) {
      const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
      return res.status(200).send({
        avatar: base64EncodedAvatar,
        login: user.login,
        status: user.status,
        pseudo: user.pseudo
      });
    }
    else
      return res.status(403).send(['Failed to request the profile.']);
  }

  @Get('userprofile/:log')
  async getProfil(@Param('log') log: string, @Res() res: ExpressResponse) {
    //console.log(`usersService.initProfile() -> ${id}`);
    const user = await this.usersService.getByLogin(log);
    if (user) {
      const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
      return res.status(200).send({
        avatar: base64EncodedAvatar,
        login: user.login,
        status: user.status,
        pseudo: user.pseudo,
        ranking: user.login,
      });
    }
  }

  @Post('userProfile')
  async getUserProfile(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
  ) {
    const user = await this.usersService.getByLogin(req.body.login);
    if (user) {
      const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
      return res.status(200).send({
        avatar: base64EncodedAvatar,
        login: user.login,
        status: user.status,
        pseudo: user.pseudo,
      });
    }
  }

  @Get('avatar/:id')
  async getAvatarFromID(@Param('id') id: string, @Res() res: ExpressResponse) {
    const user = await this.usersService.getByLogin(id);
    if (user) {
      const base64EncodedAvatar = Buffer.from(user.avatar).toString('base64');
      return res.status(200).send({
        avatar: base64EncodedAvatar,
      });
    }
    return res.status(400).send(['Failed to request the avatar.']);
  }

  @Get('leaderboard')
  async getLeaders(@Res() res: ExpressResponse) {
    const data = await this.usersService.getLeaderboard();
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(['Failed to request the leaderboard.']);
  }

  @Get('matchHistory/:id')
  async getMatchHistory(@Param('id') id: number, @Res() res: ExpressResponse) {
    console.log(`users.controller: getMatchHistory(${id})`);

    const data = await this.usersService.getById(id);
    if (data) {
      return res.status(200).send(data.matchHistory);
    }
    console.log('oof');
    return res.status(400).send(['Failed to request the match history.']);
  }

  @Get('getName/:id')
  async getName(@Param('id') id: number, @Res() res: ExpressResponse) {
    const data = await this.usersService.getById(id);
    if (data) {
      return res.status(200).send(data.login);
    }
    return res.status(400).send(['Failed to request the name.']);
  }

  @Get('invite/:id/:target')
  async invite(
    @Param('id') id: number,
    @Param('target') target: string,
    @Res() res: ExpressResponse,
  ) {
    const user = await this.usersService.invite(id, target);
    if (user) {
      return res.status(200).send(['Player invited']);
    }
    return res.status(400).send(['Failed to invite player.']);
  }

  @Get('accept/:id/:target')
  async accept(
    @Param('id') id: number,
    @Param('target') target: string,
    @Res() res: ExpressResponse,
  ) {
    const user = await this.usersService.accept(id, target);
    if (user) {
      return res.status(200).send(['Invite accepted.']);
    }
    return res.status(400).send(['Failed to accept invite.']);
  }

  @Get('decline/:id/:target')
  async decline(
    @Param('id') id: number,
    @Param('target') target: string,
    @Res() res: ExpressResponse,
  ) {
    const user = await this.usersService.decline(id, target);
    if (user) {
      return res.status(200).send(['Invite declined.']);
    }
    return res.status(400).send(['Failed to decline invite.']);
  }

  @Get('remove/:id/:target')
  async remove(
    @Param('id') id: number,
    @Param('target') target: string,
    @Res() res: ExpressResponse,
  ) {
    const user = await this.usersService.remove(id, target);
    if (user) {
      return res.status(200).send(['friend removed.']);
    }
    return res.status(400).send(['Failed to remove friend.']);
  }

  @Get('pending/:id')
  async pending(@Param('id') id: number, @Res() res: ExpressResponse) {
    const pendingInvites = await this.usersService.pending(id);
    if (pendingInvites) {
      return res.status(200).send(pendingInvites);
    }
    return res.status(400).send(['Failed to fetch invite list.']);
  }

  @Get('friends/:id')
  async getFriends(@Param('id') id: number, @Res() res: ExpressResponse) {
    const friends = await this.usersService.getFriends(id);
    if (friends) {
      return res.status(200).send(friends);
    }
    return res.status(400).send(['Failed to fetch friends list.']);
  }

  @Get('switch2fa/:id')
  async switch2fa(@Param('id') id: number, @Res() res: ExpressResponse) {
    console.log(`usersService.switch2fa() -> ${id}`);
    const user = await this.usersService.switch2fa(id);
    if (user) {
      return res.status(200).send(user);
    }
    return res.status(400).send(['Failed to switch 2fa.']);
  }
}
