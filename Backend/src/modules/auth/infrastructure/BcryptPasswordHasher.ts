import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../domain/AuthPorts';

export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds: 10;

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}