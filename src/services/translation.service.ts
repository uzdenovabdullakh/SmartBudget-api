import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  public tMessage(action: string, entity: string) {
    const lang = I18nContext.current().lang;
    return this.i18n.t(`messages.${action}`, {
      args: { entity: this.i18n.t(`entities.${entity}`) },
      lang,
    });
  }

  public tException(error: string, entity?: string) {
    const lang = I18nContext.current().lang;

    const entityTranslation = entity ? this.i18n.t(`entities.${entity}`) : '';
    return this.i18n.t(`errors.${error}`, {
      args: entity ? { entity: entityTranslation } : {},
      lang,
    });
  }
}
