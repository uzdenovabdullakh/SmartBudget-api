import { z } from 'zod';

export const LogoutSchema = z
  .object({
    refreshToken: z.string().min(1, { message: 'Token is required' }),
  })
  .required();
