import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TranslationService } from 'src/services/translation.service';
import { PUBLIC_KEY } from 'src/decorators/public.decorator';
import { ApiException } from 'src/exceptions/api.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly t: TranslationService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err || ApiException.unauthorized(this.t.tException('invalid_token'))
      );
    }
    return user;
  }
}
