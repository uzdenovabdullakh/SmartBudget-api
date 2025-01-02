import { Period } from 'src/constants/enums';
import { z } from 'zod';

const BaseCreateGoalSchema = z.object({
  name: z.string().max(64, 'Name is too long').min(1, 'Name is required'),
  targetAmount: z.number().positive().min(1),
  currentAmount: z.number().positive().optional(),
  achieveDate: z.date(),
  period: z.nativeEnum(Period),
  budgetId: z.string().uuid({ message: 'Invalid UUID format' }).optional(),
  categoryId: z.string().uuid({ message: 'Invalid UUID format' }).optional(),
});

export const CreateGoalSchema = BaseCreateGoalSchema.refine(
  (data) => data.budgetId || data.categoryId,
  {
    message: 'Either budgetId or categoryId must be provided.',
    path: ['budgetId', 'categoryId'],
  },
);

export const UpdateGoalSchema = BaseCreateGoalSchema.partial().omit({
  budgetId: true,
  categoryId: true,
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
