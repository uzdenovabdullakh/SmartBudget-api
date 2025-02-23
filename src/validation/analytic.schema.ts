import { z } from 'zod';

export const AnalyticQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AnalyticQueryDtoType = z.infer<typeof AnalyticQueryDto>;
