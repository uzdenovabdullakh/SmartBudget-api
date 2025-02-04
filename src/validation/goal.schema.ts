import i18next from 'i18next';
import { Period } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

const BaseCreateGoalSchema = z.object({
  name: z
    .string()
    .max(64, i18next.t('validation.Name too long', { ns: 'common' }))
    .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  targetAmount: z.number().positive().min(1),
  currentAmount: z.number().positive().optional(),
  achieveDate: z.date(),
  period: z.nativeEnum(Period),
  budgetId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' }))
    .optional(),
  categoryId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' }))
    .optional(),
});

export const CreateGoalSchema = BaseCreateGoalSchema.refine(
  (data) => data.budgetId || data.categoryId,
  {
    message: i18next.t(
      'validation.Either budgetId or categoryId must be provided.',
      {
        ns: 'common',
      },
    ),
    path: ['budgetId', 'categoryId'],
  },
);

export const UpdateGoalSchema = BaseCreateGoalSchema.partial().omit({
  budgetId: true,
  categoryId: true,
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
