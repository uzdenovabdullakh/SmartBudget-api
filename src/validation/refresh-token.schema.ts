import { z } from 'zod';

export const RefreshTokenSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required' }),
  })
  .required();
