import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthenticationService } from './authentication.service';
import * as superagent from 'superagent';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.UID,
      clientSecret: process.env.SECRET,
      callbackURL: process.env.URL,
      scope: ['public', 'profile'],
    });
  }

  async validate(payload: any): Promise<any> {
    const sup = await superagent.get(
      `https://api.intra.42.fr/v2/me?access_token=${payload}`,
    );
    const { login, image } = sup.body;
    const isUser = await this.usersService.getByName(login);
    if (isUser) {
      return isUser;
    } else {
      const user42 = await this.usersService.signUp42(
        login,
        image.versions.small,
      );
      if (user42) {
        return user42;
      }
      return null;
    }
  }
}
