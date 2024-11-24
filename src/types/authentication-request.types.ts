import { Request } from 'express';
import { User } from 'src/entities/user.entity';

export interface AuthenticationRequest extends Request {
  user?: User;
}
