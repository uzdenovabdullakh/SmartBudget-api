import { Period } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

export const CategoryLimitSchema = z
  .object({
    limitAmount: z.number().positive().min(1),
    limitResetPeriod: z.nativeEnum(Period),
  })
  .required();

export const UpdateCategoryLimitSchema = CategoryLimitSchema.partial();

export type CategoryLimitDto = z.infer<typeof CategoryLimitSchema>;
export type UpdateCategoryLimitDto = z.infer<typeof UpdateCategoryLimitSchema>;
