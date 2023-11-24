import { Request } from 'express';
import { User } from 'src/users/users.entity';

export interface TokenPayload {
  userId: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
