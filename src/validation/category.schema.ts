import i18next from 'i18next';
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

export const AssigningChangeSchema = z
  .object({
    assigned: z.number(),
  })
  .required();

export const MoveAvaliableSchema = z
  .object({
    from: z
      .string()
      .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
    to: z.string().uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
    amount: z.number(),
  })
  .required();

export const ReorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z
        .string()
        .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
      groupId: z
        .string()
        .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
      order: z.number().int().min(0),
    }),
  ),
});

export const CreateCategorySchema = CategorySchema;
export const UpdateCategorySchema = CategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type AssigningChangeDto = z.infer<typeof AssigningChangeSchema>;
export type MoveAvaliableDto = z.infer<typeof MoveAvaliableSchema>;
export type ReorderCategoriesDto = z.infer<typeof ReorderCategoriesSchema>;
