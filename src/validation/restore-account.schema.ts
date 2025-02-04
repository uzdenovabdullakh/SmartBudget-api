import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const RestoreAccountSchema = z
  .object({
    token: z
      .string()
      .min(1, i18next.t('validation.Token is required', { ns: 'common' })),
  })
  .required();

export type RestoreAccountDto = z.infer<typeof RestoreAccountSchema>;
