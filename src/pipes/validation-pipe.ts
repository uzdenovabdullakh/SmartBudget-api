import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ApiException } from 'src/exceptions/api.exception';
import { ZodError, ZodSchema } from 'zod';

export class ValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw ApiException.badRequest(error.message);
      }
      throw error;
    }
  }
}
