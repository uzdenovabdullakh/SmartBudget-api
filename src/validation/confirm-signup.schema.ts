import { z } from 'zod';

export const ConfirmSignUpSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(32, { message: 'Password must be at less then 32 characters long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character',
      }),
  })
  .required();
