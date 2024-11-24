import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ApiException } from 'src/exceptions/api.exception';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = JSON.parse(error.message)
          .map((d) => d.message.replace(/\"/g, ''))
          .join('\n');
        throw ApiException.badRequest(errorMessages);
      }
      throw error;
    }
  }
}
