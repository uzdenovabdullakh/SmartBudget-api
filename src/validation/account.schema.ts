import i18next from 'i18next';
import { AccountType } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

export const CreateAccountSchema = z.object({
  name: z
    .string()
    .max(128, i18next.t('validation.Name too long', { ns: 'common' }))
    .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  budgetId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
  type: z.nativeEnum(AccountType),
  amount: z.number().optional().default(0),
});

export const UpdateAccountSchema = CreateAccountSchema.pick({
  name: true,
})
  .partial()
  .optional();

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
