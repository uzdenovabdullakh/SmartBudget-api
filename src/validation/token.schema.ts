import { ErrorMessages } from 'src/constants/constants';
import { z } from 'zod';

export const TokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, { message: ErrorMessages.IS_REQUIRED('Token') }),
  })
  .required();

export type TokenDto = z.infer<typeof TokenSchema>;
