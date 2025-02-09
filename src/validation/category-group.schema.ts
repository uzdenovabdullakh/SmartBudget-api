import { z } from 'zod';

export const CreateCategoryGroupSchema = z
  .object({
    name: z.string().max(128, 'Name is too long').min(1, 'Name is required'),
  })
  .required();

export type CreateCategoryGroupDto = z.infer<typeof CreateCategoryGroupSchema>;
