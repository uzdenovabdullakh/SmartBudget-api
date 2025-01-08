import { ErrorMessages } from 'src/constants/constants';
import { Period } from 'src/constants/enums';
import { z } from 'zod';

const BaseCreateGoalSchema = z.object({
  name: z
    .string()
    .max(64, ErrorMessages.TOO_LONG('Name'))
    .min(1, ErrorMessages.IS_REQUIRED('Name')),
  targetAmount: z.number().positive().min(1),
  currentAmount: z.number().positive().optional(),
  achieveDate: z.date(),
  period: z.nativeEnum(Period),
  budgetId: z.string().uuid({ message: ErrorMessages.INVALID_UUID }).optional(),
  categoryId: z
    .string()
    .uuid({ message: ErrorMessages.INVALID_UUID })
    .optional(),
});

export const CreateGoalSchema = BaseCreateGoalSchema.refine(
  (data) => data.budgetId || data.categoryId,
  {
    message: ErrorMessages.MUST_PROVIDED('Either budgetId or categoryId'),
    path: ['budgetId', 'categoryId'],
  },
);

export const UpdateGoalSchema = BaseCreateGoalSchema.partial().omit({
  budgetId: true,
  categoryId: true,
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
