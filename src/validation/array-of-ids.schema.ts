import { z } from 'zod';

export const ArrayOfIdsSchema = z
  .array(z.string().uuid({ message: 'Invalid UUID format' }))
  .min(1, { message: 'Array must contain at least one UUID' })
  .max(10, { message: 'Array must not contain more than 10 UUIDs' });
