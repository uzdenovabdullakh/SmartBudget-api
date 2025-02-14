import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const CreateCategoryGroupSchema = z
  .object({
    name: z
      .string()
      .max(128, i18next.t('validation.Name too long', { ns: 'common' }))
      .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
    budgetId: z
      .string()
      .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
  })
  .required();

export const UpdateCategoryGroupSchema =
  CreateCategoryGroupSchema.partial().pick({ name: true });

export type CreateCategoryGroupDto = z.infer<typeof CreateCategoryGroupSchema>;
export type UpdateCategoryGroupDto = z.infer<typeof UpdateCategoryGroupSchema>;
