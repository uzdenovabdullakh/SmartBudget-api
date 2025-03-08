import i18next from 'i18next';
import { GetGoalFilter } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

const BaseCreateGoalSchema = z.object({
  name: z
    .string()
    .max(64, i18next.t('validation.Name too long', { ns: 'common' }))
    .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  targetAmount: z.number().positive().min(1),
  currentAmount: z.number().nonnegative().optional(),
  achieveDate: z.string(),
});

export const GetGoalQuerySchema = z.object({
  filter: z.nativeEnum(GetGoalFilter),
});

export const CreateGoalSchema = BaseCreateGoalSchema;
export const UpdateGoalSchema = BaseCreateGoalSchema.partial();

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type GetGoalQuery = z.infer<typeof GetGoalQuerySchema>;
