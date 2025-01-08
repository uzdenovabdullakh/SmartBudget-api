import { ErrorMessages } from 'src/constants/constants';
import { z } from 'zod';

export const RestoreAccountRequestSchema = z
  .object({
    email: z.string().email({ message: ErrorMessages.INVALID_EMAIL }),
  })
  .required();

export type RestoreAccountRequestDto = z.infer<
  typeof RestoreAccountRequestSchema
>;
