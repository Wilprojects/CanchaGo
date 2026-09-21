import type {PublicUser,} from "@/modules/users/user.types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSessionResult {
  user: PublicUser;

  accessToken: string;

  refreshToken: string;

  refreshExpiresAt: Date;

  expiresIn: number;
}