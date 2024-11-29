import { z } from 'zod';

const BudgetSettingsSchema = z.object({
  currency: z.enum(['USD', 'RUB', 'EUR']),
  currencyPlacement: z.enum(['before', 'after']),
});

export const CreateBudgetSchema = z.object({
  name: z.string().max(128, 'Name is too long').min(1, 'Name is required'),
  settings: BudgetSettingsSchema.optional(),
});

export const UpdateBudgetSchema = CreateBudgetSchema.partial().optional();

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
export type BudgetSettings = z.infer<typeof BudgetSettingsSchema>;
