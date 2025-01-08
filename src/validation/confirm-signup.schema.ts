import { z } from 'zod';
import { passwordSchema } from './password.schema';
import { ErrorMessages } from 'src/constants/constants';

export const ConfirmSignUpSchema = z
  .object({
    token: z.string().min(1, { message: ErrorMessages.IS_REQUIRED('Token') }),
    password: passwordSchema,
  })
  .required();

export type ConfirmSignUpDto = z.infer<typeof ConfirmSignUpSchema>;
