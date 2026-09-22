export type UserRole = | "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}