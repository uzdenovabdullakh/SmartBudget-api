import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  order: z.enum(['ASC', 'DESC']).optional(),
  page: z.coerce.number().int().positive().min(1).optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  search: z
    .string()
    .optional()
    .transform((search) => search?.toLowerCase()),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
