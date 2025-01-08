import { z } from 'zod';
import { Period } from 'src/constants/enums';
import { ErrorMessages } from 'src/constants/constants';

export const CategorySchema = z
  .object({
    name: z
      .string()
      .max(128, ErrorMessages.TOO_LONG('Name'))
      .min(1, ErrorMessages.IS_REQUIRED('Name')),
    groupId: z.string().uuid({ message: ErrorMessages.INVALID_UUID }),
    budgetId: z.string().uuid({ message: ErrorMessages.INVALID_UUID }),
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
