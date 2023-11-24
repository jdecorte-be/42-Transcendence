import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { JwtAuthenticationGuard, LocalAuthGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { codeDto, FirstLogDto, loginDto, SignDto } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import { TFAService } from './twilio.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly usersService: UsersService,
    private readonly tfaService: TFAService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async addToCache(key: string, item: string): Promise<any> {
    await this.cacheManager.set(key, item, 3000);
  }

  async getFromCache(key: string) {
    const value = await this.cacheManager.get(key);
    const str: string = value as string;
    return str;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('who')
  who(@Req() req: any) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Get()
  auth() {
    console.log(`authentication.controller: auth(42auth)`);
  }

  @Get('jwt/:id')
  async jwt(@Param('id') id: number, @Res() res: ExpressResponse) {
    const user = await this.usersService.getById(id);
    const token = await this.authService.login(user);
    return res.status(200).send(token);
  }

  @Get('fetchUser')
  async fetchUser(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    if (req.headers.authorization) {
      const authToken = req.headers.authorization.split(' ')[1];
      const secret = this.configService.get('JWT_SECRET') as string;
      const result = jwt.verify(authToken, Buffer.from(secret, 'base64'));
      const v = Object.values(result);
      const user = await this.usersService.getByName(v[0]);
      if (user) return res.status(200).send(user);
    }
    return res.status(200).send();
  }

  @UseGuards(LocalAuthGuard)
  @Get('redirect')
  async redirect(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    console.log(`authentication.controller: redirect(signin) ---> SUCCESS`);
    let flog = true;
    if (req.user) {
      const v = Object.values(req.user);
      let login = '';
      if (flog) {
        login = v[0];
        flog = false;
      } else {
        login = v[1];
      }
      let user = await this.usersService.getByName(login);
      if (!user) {
        user = await this.usersService.getById(Number.parseInt(login));
      }
      if (user) {
        const userId = new URLSearchParams({
          id: user.id.toString(),
        });
        if (user.pseudo === null) {
          return res.redirect(`http://localhost:3000/FirstLog?${userId}`);
        } else {
          return res.redirect(`http://localhost:3000/CoPage?${userId}`);
        }
      }
    }
    return res.status(400).send(['Something went wrong.']);
  }

  @Post('signup')
  async signup(@Res() res: ExpressResponse, @Body() register: SignDto) {
    const user = await this.usersService.signUp(register);
    if (user[1] === '23505') return res.status(400).send(user);
    return res.status(201).send(user);
  }

  @Post('signin')
  async signIn(@Res() res: ExpressResponse, @Body() body: loginDto) {
    const user = await this.usersService.signIn(body);
    let fLog = true;
    try {
      if ((await this.usersService.getByLogin(body.login)).pseudo === null)
        fLog = true;
      else fLog = false;
    } catch (error) {
      console.log('AAAAAAAAAHHH');
    }
    if (user) {
      if (user.has2fa === true) {
        const { phoneNumber } = user;
        const code = Math.floor(1000 + Math.random() * 9000);
        await this.tfaService.sendSms(
          phoneNumber,
          `Your verification code is: ${code}`,
        );
        await this.usersService.set2fa(user.id, code.toString());
      }
      const cookie = await this.authService.login(body);
      return res.status(200).send({ user, cookie, fLog });
    }
    return res.status(401).send(['Invalid credentials']);
  }

  @Post('firstlog')
  async firstlog(@Res() res: ExpressResponse, @Body() body: FirstLogDto) {
    const user = await this.usersService.getById(parseInt(body.id));
    if (user) {
      user.pseudo = body.pseudo;
      await this.usersService.getUserRepository().save(user);
      return res.status(200).send(user);
    }
    return res.status(401).send(['Pseudo already taken']);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('code/:id')
  async tfaCode(
    @Param('id') id: number,
    @Res() res: ExpressResponse,
    @Body() body: codeDto,
  ) {
    const validate = await this.usersService.validate2fa(id, body.code);
    if (validate) {
      return res.status(200).send(['2FA Successful.']);
    }
    return res.status(401).send(['Invalid code provided']);
  }
}
