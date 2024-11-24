import { z } from 'zod';

export const RestoreUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }).max(64),
  })
  .required();
