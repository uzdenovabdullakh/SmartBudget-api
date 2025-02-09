import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

const currencySymbols = {
  USD: '$',
  RUB: '₽',
  EUR: '€',
};

const BudgetSettingsSchema = z.object({
  currency: z
    .enum(['USD', 'RUB', 'EUR'])
    .transform((currencyCode) => currencySymbols[currencyCode]),
  currencyPlacement: z.enum(['before', 'after']),
});

export const CreateBudgetSchema = z.object({
  name: z
    .string()
    .max(128, i18next.t('validation.Name too long', { ns: 'common' }))
    .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  settings: BudgetSettingsSchema.optional(),
});

export const UpdateBudgetSchema = CreateBudgetSchema.partial().optional();

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
export type BudgetSettings = z.infer<typeof BudgetSettingsSchema>;
