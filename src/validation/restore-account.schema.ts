import { ErrorMessages } from 'src/constants/constants';
import { z } from 'zod';

export const RestoreAccountSchema = z
  .object({
    token: z.string().min(1, { message: ErrorMessages.IS_REQUIRED('Token') }),
  })
  .required();

export type RestoreAccountDto = z.infer<typeof RestoreAccountSchema>;
