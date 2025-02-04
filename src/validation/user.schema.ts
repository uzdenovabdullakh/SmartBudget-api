import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const CreateUserSchema = z
  .object({
    email: z
      .string()
      .email(i18next.t('validation.Invalid email address', { ns: 'common' }))
      .max(64),
    login: z.string().min(3).max(64),
  })
  .required();

export const UpdateUserSchema = CreateUserSchema.partial()
  .extend({
    settings: z.object({}).optional(),
    isActivated: z.boolean().optional(),
  })
  .optional();

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
