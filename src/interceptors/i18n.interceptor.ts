import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import i18next from 'i18next';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang = request.headers['accept-language'] || 'en';

    i18next.changeLanguage(lang);

    return next.handle().pipe(
      map((data) => {
        if (data?.messageKey) {
          return { message: this.i18n.t(data.messageKey, { lang }) };
        }
        return data;
      }),
    );
  }
}
