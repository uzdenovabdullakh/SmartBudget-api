import { z } from 'zod';
import { Period } from 'src/constants/enums';

export const CategorySchema = z
  .object({
    name: z.string().max(128, 'Name is too long').min(1, 'Name is required'),
    groupId: z.string().uuid({ message: 'Invalid UUID format' }),
    budgetId: z.string().uuid({ message: 'Invalid UUID format' }),
  })
  .required();

export const CategoryLimitSchema = z
  .object({
    limitAmount: z.number().positive().min(1),
    limitResetPeriod: z.nativeEnum(Period),
  })
  .required();

export const CreateCategorySchema = CategorySchema;
export const UpdateCategorySchema = CategorySchema.partial().omit({
  groupId: true,
  budgetId: true,
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryLimitDto = z.infer<typeof CategoryLimitSchema>;
