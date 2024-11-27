import { z } from 'zod';

export const ResetPasswordRequestSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
  })
  .required();

export type ResetPasswordRequestDto = z.infer<
  typeof ResetPasswordRequestSchema
>;
