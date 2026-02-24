import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

interface ThrottlerRequest {
	user?: { sub: string };
	ip: string;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	protected async getTracker(req: ThrottlerRequest): Promise<string> {
		return req.user?.sub ?? req.ip;
	}
}
