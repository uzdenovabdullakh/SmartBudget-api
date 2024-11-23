import { z } from 'zod';

export const UpdateUserSchema = z
  .object({
    email: z.string().email().max(64).optional(),
    login: z.string().min(3).max(64).optional(),
    settings: z.object({}).optional(),
    isActivated: z.boolean().optional(),
  })
  .optional();
