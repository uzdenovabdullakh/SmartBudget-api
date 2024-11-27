import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const LoginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
  })
  .required();

export type LoginDto = z.infer<typeof LoginSchema>;
