import { z } from 'src/utils/zod-map';

export const RestoreAccountRequestSchema = z
  .object({
    email: z.string().email(),
  })
  .required();

export type RestoreAccountRequestDto = z.infer<
  typeof RestoreAccountRequestSchema
>;
