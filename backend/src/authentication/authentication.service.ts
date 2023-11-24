import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log(`authentication.service validateUser(${username})`);
    const user = await this.usersService.getByLogin(username);
    console.log(user);
    if (user) {
      const result = bcrypt.compareSync(user.password, password);
      if (result) return user;
    }
    return null;
  }

  async login(user: any) {
    console.log(`authentication.service login(${user.login})`);
    const payload = {
      // sub: user.id,
      name: user.login,
      iat: Math.round(new Date().getTime() / 1000),
    };
    const secret = this.configService.get('JWT_SECRET') as string;
    return `Bearer ${jwt.sign(payload, Buffer.from(secret, 'base64'), {
      algorithm: 'HS256',
    })}`;
  }
}
