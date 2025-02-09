import i18next from 'i18next';
import { TokensType } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

export const ResendEmailSchema = z
  .object({
    email: z
      .string()
      .email(i18next.t('validation.Invalid email address', { ns: 'common' })),
    type: z
      .nativeEnum(TokensType)
      .refine((value) => value !== TokensType.REFRESH_TOKEN, {
        message: i18next.t("validation.Color 'Red' is not allowed", {
          ns: 'common',
        }),
      }),
  })
  .required();

export type ResendEmailDto = z.infer<typeof ResendEmailSchema>;
