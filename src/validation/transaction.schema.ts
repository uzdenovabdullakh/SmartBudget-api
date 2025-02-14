import i18next from 'i18next';
import { z } from 'src/utils/zod-map';
import { PaginationQuerySchema } from './pagination.schema';

const transactionSchema = z.object({
  inflow: z.coerce.number().optional().nullable(),
  outflow: z.coerce.number().optional().nullable(),
  description: z.string(),
  date: z.string(),
  category: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' }))
    .optional(),
  accountId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
});

export const CreateTransactionSchema = transactionSchema;
export const UpdateTransactionSchema = transactionSchema
  .partial()
  .omit({ accountId: true });

export const ExportTypeSchema = z.object({ type: z.enum(['csv', 'xlsx']) });

export const GetTransactionsSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    category: z
      .string()
      .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' }))
      .optional(),
    inflow: z.boolean().optional(),
    outflow: z.boolean().optional(),
  })
  .and(PaginationQuerySchema);

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type ExportTypeQuery = z.infer<typeof ExportTypeSchema>;
export type GetTransactionsQuery = z.infer<typeof GetTransactionsSchema>;
