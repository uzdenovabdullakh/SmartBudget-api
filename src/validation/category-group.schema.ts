import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const CreateCategoryGroupSchema = z
  .object({
    name: z
      .string()
      .max(128, i18next.t('validation.Name too long', { ns: 'common' }))
      .min(1, i18next.t('validation.Name is required', { ns: 'common' })),
  })
  .required();

export type CreateCategoryGroupDto = z.infer<typeof CreateCategoryGroupSchema>;
