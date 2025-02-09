import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const ConfirmSignUpSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required' }),
    password: passwordSchema,
  })
  .required();

export type ConfirmSignUpDto = z.infer<typeof ConfirmSignUpSchema>;
