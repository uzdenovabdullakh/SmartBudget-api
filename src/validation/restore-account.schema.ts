import { z } from 'zod';

export const RestoreAccountSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required' }),
  })
  .required();

export type RestoreAccountDto = z.infer<typeof RestoreAccountSchema>;
