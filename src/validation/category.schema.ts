import i18next from 'i18next';
import { Period } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

export const CategorySchema = z
  .object({
    name: z
      .string()
      .max(128, i18next.t('validation.Name too long', { ns: 'common' }))
      .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
    groupId: z
      .string()
      .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
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
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryLimitDto = z.infer<typeof CategoryLimitSchema>;
