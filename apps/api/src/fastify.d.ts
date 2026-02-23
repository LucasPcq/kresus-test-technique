import "fastify";

import type { JwtPayload } from "@kresus/contract";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}
