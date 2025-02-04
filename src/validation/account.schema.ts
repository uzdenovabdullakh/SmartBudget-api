import i18next from 'i18next';
import { AccountType } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

export const CreateUnlinkedAccountSchema = z.object({
  name: z
    .string()
    .max(1, i18next.t('validation.Name too long', { ns: 'common' }))
    .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  budgetId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
  type: z.nativeEnum(AccountType),
  amount: z.number().optional().default(0),
});

export type CreateUnlinkedAccountDto = z.infer<
  typeof CreateUnlinkedAccountSchema
>;
