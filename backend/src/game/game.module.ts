import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { JwtStrategy } from 'src/authentication/jwt.strategy';
import { LocalStrategy } from 'src/authentication/local.strategy';
import { SessionSerializer } from 'src/authentication/serializer';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
  ],
  providers: [
    AuthenticationService,
    JwtStrategy,
    GameGateway,
  Object],
})
export class GameModule {}
