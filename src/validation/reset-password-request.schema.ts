import { ErrorMessages } from 'src/constants/constants';
import { z } from 'zod';

export const ResetPasswordRequestSchema = z
  .object({
    email: z.string().email({ message: ErrorMessages.INVALID_EMAIL }),
  })
  .required();

export type ResetPasswordRequestDto = z.infer<
  typeof ResetPasswordRequestSchema
>;
