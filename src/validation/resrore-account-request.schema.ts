import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const RestoreAccountRequestSchema = z
  .object({
    email: z
      .string()
      .email(i18next.t('validation.Invalid email address', { ns: 'common' })),
  })
  .required();

export type RestoreAccountRequestDto = z.infer<
  typeof RestoreAccountRequestSchema
>;
