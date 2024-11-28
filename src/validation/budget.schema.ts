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

export const BudgetsIdsSchema = z
  .array(z.string().uuid({ message: 'Invalid UUID format' }))
  .min(1, { message: 'Array must contain at least one UUID' })
  .max(10, { message: 'Array must not contain more than 10 UUIDs' });

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
export type BudgetSettings = z.infer<typeof BudgetSettingsSchema>;
