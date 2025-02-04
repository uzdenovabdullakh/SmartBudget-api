import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const TokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, i18next.t('validation.Token is required', { ns: 'common' })),
  })
  .required();

export type TokenDto = z.infer<typeof TokenSchema>;
