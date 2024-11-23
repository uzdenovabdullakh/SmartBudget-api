import { z } from 'zod';

export const RestoreUserSchema = z
  .object({
    email: z.string().email().max(64),
  })
  .required();
