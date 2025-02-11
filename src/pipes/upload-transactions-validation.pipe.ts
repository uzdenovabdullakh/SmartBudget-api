import { PipeTransform, Injectable } from '@nestjs/common';
import i18next from 'i18next';
import { ApiException } from 'src/exceptions/api.exception';

@Injectable()
export class UploadTransactionsValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    const isAccessType = /\.(csv|xlsx|)$/i.test(value?.originalname);
    if (!isAccessType)
      throw ApiException.badRequest(
        i18next.t('validation.Error format', { ns: 'common' }),
      );
    return value;
  }
}
