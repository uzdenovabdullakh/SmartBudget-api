import i18next from 'i18next';
import { TransactionType } from 'src/constants/enums';
import { z } from 'src/utils/zod-map';

const transactionSchema = z.object({
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  description: z.string(),
  date: z.string(),
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
    startDate: z.string(),
    endDate: z.string(),
    category: z
      .string()
      .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
    type: z.nativeEnum(TransactionType),
  })
  .optional();

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type ExportTypeQuery = z.infer<typeof ExportTypeSchema>;
export type GetTransactionsQuery = z.infer<typeof GetTransactionsSchema>;
