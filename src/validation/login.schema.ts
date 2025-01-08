import { z } from 'zod';
import { passwordSchema } from './password.schema';
import { ErrorMessages } from 'src/constants/constants';

export const LoginSchema = z
  .object({
    email: z.string().email(ErrorMessages.INVALID_EMAIL),
    password: passwordSchema,
  })
  .required();

export type LoginDto = z.infer<typeof LoginSchema>;
