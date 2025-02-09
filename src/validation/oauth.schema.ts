import { z } from 'src/utils/zod-map';
import i18next from 'i18next';

export const OauthSchema = z
  .object({
    email: z
      .string()
      .email(i18next.t('validation.Invalid email address', { ns: 'common' })),
    login: z.string(),
    yandexId: z.string(),
  })
  .required();

export type OauthDto = z.infer<typeof OauthSchema>;
