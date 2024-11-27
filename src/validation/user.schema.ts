import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }).max(64),
    login: z.string().min(3).max(64),
  })
  .required();

export const UpdateUserSchema = CreateUserSchema.partial()
  .extend({
    settings: z.object({}).optional(),
    isActivated: z.boolean().optional(),
  })
  .optional();

export const RestoreUserSchema = CreateUserSchema.pick({ email: true });

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type RestoreUserDto = z.infer<typeof RestoreUserSchema>;
