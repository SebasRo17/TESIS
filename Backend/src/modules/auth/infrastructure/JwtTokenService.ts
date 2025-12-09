import jwt from "jsonwebtoken";
import { env } from "../../../config/env";
import type { TokenService } from "../domain/AuthPorts";

export class JwtTokenService implements TokenService {
  signAccess(user: { id: number; email: string }): string {
    return jwt.sign(user, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessTtl,
    });
  }

  signRefresh(user: { id: number; email: string }): string {
    return jwt.sign(user, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshTtl,
    });
  }

  verifyRefresh(token: string): { id: number; email: string } {
    return jwt.verify(token, env.jwt.refreshSecret) as {
      id: number;
      email: string;
    };
  }

  verifyAccess(token: string): { id: number; email: string } {
    return jwt.verify(token, env.jwt.accessSecret) as {
      id: number;
      email: string;
    };
  }
}