import { z } from "zod";

export const toSwaggerSchema = (schema: z.ZodType) =>
  JSON.parse(JSON.stringify(z.toJSONSchema(schema)));
