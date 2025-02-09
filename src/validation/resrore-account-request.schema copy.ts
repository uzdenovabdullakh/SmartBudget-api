import { z } from 'zod';

export const RestoreAccountRequestSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
  })
  .required();

export type RestoreAccountRequestDto = z.infer<
  typeof RestoreAccountRequestSchema
>;
