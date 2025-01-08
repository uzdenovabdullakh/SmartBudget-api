import { z } from 'zod';
import { passwordSchema } from './password.schema';
import { ErrorMessages } from 'src/constants/constants';

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: ErrorMessages.IS_REQUIRED('Token') }),
    newPassword: passwordSchema,
  })
  .required();

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
