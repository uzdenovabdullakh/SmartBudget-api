import { ErrorMessages } from 'src/constants/constants';
import { TokensType } from 'src/constants/enums';
import { z } from 'zod';

export const ResendEmailSchema = z
  .object({
    email: z.string().email({ message: ErrorMessages.INVALID_EMAIL }),
    type: z
      .nativeEnum(TokensType)
      .refine((value) => value !== TokensType.REFRESH_TOKEN, {
        message: ErrorMessages.NOT_ALLOWED("Color 'Red'"),
      }),
  })
  .required();

export type ResendEmailDto = z.infer<typeof ResendEmailSchema>;
