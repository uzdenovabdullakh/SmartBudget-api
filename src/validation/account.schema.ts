import { ErrorMessages } from 'src/constants/constants';
import { UnlinkedAccountType } from 'src/constants/enums';
import { z } from 'zod';

export const CreateUnlinkedAccountSchema = z.object({
  name: z
    .string()
    .max(128, ErrorMessages.TOO_LONG('Name'))
    .min(1, ErrorMessages.IS_REQUIRED('Name')),
  budgetId: z.string().uuid({ message: ErrorMessages.INVALID_UUID }),
  type: z.nativeEnum(UnlinkedAccountType),
  amount: z.number().optional().default(0),
});

export type CreateUnlinkedAccountDto = z.infer<
  typeof CreateUnlinkedAccountSchema
>;
