import { z } from 'src/utils/zod-map';
import { passwordSchema } from './password.schema';
import i18next from 'i18next';

export const ConfirmSignUpSchema = z
  .object({
    token: z
      .string()
      .min(1, i18next.t('validation.Token is required', { ns: 'common' })),
    password: passwordSchema,
  })
  .required();

export type ConfirmSignUpDto = z.infer<typeof ConfirmSignUpSchema>;
