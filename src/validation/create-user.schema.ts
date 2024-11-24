import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }).max(64),
    login: z.string().min(3).max(64),
  })
  .required();
