import { z } from 'src/utils/zod-map';
import { passwordSchema } from './password.schema';
import i18next from 'i18next';

export const LoginSchema = z
  .object({
    email: z
      .string()
      .email(i18next.t('validation.Invalid email address', { ns: 'common' })),
    password: passwordSchema,
  })
  .required();

export type LoginDto = z.infer<typeof LoginSchema>;
