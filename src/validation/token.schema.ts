import { z } from 'zod';

export const TokenSchema = z
  .object({
    refreshToken: z.string().min(1, { message: 'Token is required' }),
  })
  .required();

export type TokenDto = z.infer<typeof TokenSchema>;
