import { TokensType } from 'src/constants/enums';
import { z } from 'zod';

export const ResendEmailSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    type: z
      .nativeEnum(TokensType)
      .refine((value) => value !== TokensType.REFRESH_TOKEN, {
        message: "Color 'Red' is not allowed",
      }),
  })
  .required();

export type ResendEmailDto = z.infer<typeof ResendEmailSchema>;
