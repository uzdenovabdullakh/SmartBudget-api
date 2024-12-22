import { z } from 'zod';

export const ResendEmailSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    type: z.enum(['activate_account', 'reset_password']),
  })
  .required();

export type ResendEmailDto = z.infer<typeof ResendEmailSchema>;
