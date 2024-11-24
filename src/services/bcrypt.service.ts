import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}
  async hash(password: string): Promise<string> {
    const salt = parseInt(this.configService.get<string>('SALT_ROUNDS'));
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
  async comparePasswords(rawPassword: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(rawPassword, hash);
    return isMatch;
  }
}
