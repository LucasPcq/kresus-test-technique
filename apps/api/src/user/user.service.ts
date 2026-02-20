import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	findByEmail({ email }: { email: string }) {
		return this.userRepository.findByEmail({ email });
	}

	create({ data }: { data: Prisma.UserCreateInput }) {
		return this.userRepository.create({ data });
	}
}
