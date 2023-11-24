import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<any>('PORT');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('app');
  app.use(cookieParser());
  app.use(
    session({
      cookie: {
        maxAge: Number(configService.get('JWT_EXPIRATION_TIME')),
      },
      secret: configService.get<any>('JWT_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      /^http:\/\/localhost:3002\/socket\.io\/*/,
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT'],
    optionsSuccessStatus: 200,
  });

  await app.listen(PORT);
  console.log(`App listening on port: ${PORT}`);
}
bootstrap();
