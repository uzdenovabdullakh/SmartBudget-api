import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokenPayload } from 'src/types/jwt.types';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async validateToken(token?: string): Promise<boolean> {
    try {
      if (!token) return false;
      const isValid = await this.jwtService.verifyAsync(token);
      return !!isValid;
    } catch (error) {
      return false;
    }
  }

  async generateToken(
    payload: GenerateTokenPayload,
    tokenLifeTime: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: tokenLifeTime,
    });
  }
}
