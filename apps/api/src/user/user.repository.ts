import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserRepository {
	constructor(private readonly prisma: PrismaService) {}

	findByEmail({ email }: { email: string }) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	create({ data }: { data: Prisma.UserCreateInput }) {
		return this.prisma.user.create({ data });
	}
}
