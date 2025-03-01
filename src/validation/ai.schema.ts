import i18next from 'i18next';
import { z } from 'src/utils/zod-map';

export const ProvideFinancialAdviceSchema = z.object({
  message: z.string(),
  budgetId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
});
export const AutoCategorizeSchema = z.object({
  accountId: z
    .string()
    .uuid(i18next.t('validation.Invalid uuid', { ns: 'common' })),
});

export type ProvideFinancialAdviceDto = z.infer<
  typeof ProvideFinancialAdviceSchema
>;
export type AutoCategorizeDto = z.infer<typeof AutoCategorizeSchema>;
