import { z } from 'zod';

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, { message: 'Token is required' }),
  })
  .required();
