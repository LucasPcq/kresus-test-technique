import type { PipeTransform } from "@nestjs/common";

import type { ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
