import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const passwordSchema = z
  .string()
  .min(
    8,
    i18next.t('validation.Password must be at least 8 characters long', {
      ns: 'common',
    }),
  )
  .max(
    32,
    i18next.t('validation.Password must be less than 32 characters long', {
      ns: 'common',
    }),
  )
  .regex(
    /[A-Z]/,
    i18next.t(
      'validation.Password must contain at least one uppercase letter',
      {
        ns: 'common',
      },
    ),
  )
  .regex(
    /[a-z]/,
    i18next.t(
      'validation.Password must contain at least one lowercase letter',
      {
        ns: 'common',
      },
    ),
  )
  .regex(
    /[0-9]/,
    i18next.t('validation.Password must contain at least one number', {
      ns: 'common',
    }),
  )
  .regex(
    /[\W_]/,
    i18next.t(
      'validation.Password must contain at least one special character',
      {
        ns: 'common',
      },
    ),
  );
