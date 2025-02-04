import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const ArrayOfIdsSchema = z
  .array(
    z.string().uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
  )
  .min(
    1,
    i18next.t('validation.Array must contain at least one UUID', {
      ns: 'common',
    }),
  )
  .max(
    10,
    i18next.t('validation.Array must not contain more than 10 UUIDs', {
      ns: 'common',
    }),
  );
