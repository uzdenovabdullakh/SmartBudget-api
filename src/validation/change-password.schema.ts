import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const ChangePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .required();

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
