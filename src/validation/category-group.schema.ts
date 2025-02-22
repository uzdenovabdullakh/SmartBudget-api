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

export const GetCategoryGroupSchema = z.object({
  default: z.coerce.boolean().optional(),
});

export const ReorderCategoryGroupsSchema = z.object({
  groups: z.array(
    z.object({
      id: z
        .string()
        .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
      order: z.number().int().min(0),
    }),
  ),
});

export type CreateCategoryGroupDto = z.infer<typeof CreateCategoryGroupSchema>;
export type UpdateCategoryGroupDto = z.infer<typeof UpdateCategoryGroupSchema>;
export type GetCategoryGroup = z.infer<typeof GetCategoryGroupSchema>;
export type ReorderCategoryGroupsDto = z.infer<
  typeof ReorderCategoryGroupsSchema
>;
