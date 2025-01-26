import { AccountType } from 'src/constants/enums';
import { z } from 'zod';

export const CreateUnlinkedAccountSchema = z.object({
  name: z.string().max(128, 'Name is too long').min(1, 'Name is required'),
  budgetId: z.string().uuid({ message: 'UUID invalid format' }),
  type: z.nativeEnum(AccountType),
  amount: z.number().optional().default(0),
});

export type CreateUnlinkedAccountDto = z.infer<
  typeof CreateUnlinkedAccountSchema
>;
