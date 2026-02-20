import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const comparePassword = (plain: string, hashed: string) => bcrypt.compare(plain, hashed);
