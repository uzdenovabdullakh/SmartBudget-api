import i18next from 'i18next';
import { z } from 'src/utils/zod-map';
import { PaginationQuerySchema } from './pagination.schema';

const transactionSchema = z.object({
  inflow: z.coerce.number().optional().nullable(),
  outflow: z.coerce.number().optional().nullable(),
  description: z.string().nullable().optional(),
  date: z.string(),
  category: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' }))
    .nullable()
    .optional(),
  accountId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
});

export const CreateTransactionSchema = transactionSchema;
export const UpdateTransactionSchema = transactionSchema
  .partial()
  .omit({ accountId: true });

export const GetTransactionsSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    orderBy: z
      .enum(['inflow', 'outflow', 'category_name', 'date'])
      .optional()
      .transform((data) => {
        if (!data) {
          return data;
        }
        if (data === 'category_name') {
          return 'category.name';
        }
        return `transaction.${data}`;
      }),
  })
  .and(PaginationQuerySchema);

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type GetTransactionsQuery = z.infer<typeof GetTransactionsSchema>;
