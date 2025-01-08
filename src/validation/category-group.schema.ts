import { ErrorMessages } from 'src/constants/constants';
import { z } from 'zod';

export const CreateCategoryGroupSchema = z
  .object({
    name: z
      .string()
      .max(128, ErrorMessages.TOO_LONG('Name'))
      .min(1, ErrorMessages.IS_REQUIRED('Name')),
  })
  .required();

export type CreateCategoryGroupDto = z.infer<typeof CreateCategoryGroupSchema>;
