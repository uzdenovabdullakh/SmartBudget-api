import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const CreateAutoReplenishmentSchema = z.object({
  goal: z.string().uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
  percentage: z.number().min(1).max(100),
});

export const UpdateAutoReplenishmentSchema = CreateAutoReplenishmentSchema.pick(
  {
    percentage: true,
  },
).partial();

export type CreateAutoReplenishmentDto = z.infer<
  typeof CreateAutoReplenishmentSchema
>;
export type UpdateAutoReplenishmentDto = z.infer<
  typeof UpdateAutoReplenishmentSchema
>;
