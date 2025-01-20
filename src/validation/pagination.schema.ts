import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  order: z
    .enum(['asc', 'desc'])
    .optional()
    .transform((order) => order?.toUpperCase()),
  page: z.coerce.number().int().positive().min(1).optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
