import { Injectable } from "@nestjs/common";
import { User, Prisma } from "@prisma/client";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findByEmail(email: User["email"]) {
    return this.userRepository.findByEmail(email);
  }

  create(data: Prisma.UserCreateInput) {
    return this.userRepository.create(data);
  }
}
