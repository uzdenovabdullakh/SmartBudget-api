import { ValueTransformer } from 'typeorm';

export class NumericTransformer implements ValueTransformer {
  to(value: number): string | number {
    if (!value) {
      return value;
    }
    return value.toString();
  }

  from(value: string): number {
    return parseFloat(value);
  }
}
