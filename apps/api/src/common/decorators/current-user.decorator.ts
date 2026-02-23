import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { JwtPayload } from "@kresus/contract";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
