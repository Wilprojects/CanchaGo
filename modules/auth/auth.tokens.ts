import {createHash, randomBytes,} from "node:crypto";

import {SignJWT, jwtVerify,} from "jose";

import {UserRole,} from "@/generated/prisma/enums";

import { env } from "@/lib/config/env";

const JWT_ISSUER = "canchago";
const JWT_AUDIENCE = "canchago-web";

const accessTokenSecret =
  new TextEncoder().encode(env.jwtAccessSecret,);

interface AccessTokenUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AccessTokenClaims {
  userId: number;
  email: string;
  role: UserRole;
}

export async function signAccessToken(
  user: AccessTokenUser,
): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({alg: "HS256",})
    .setSubject(String(user.id),)
    .setIssuer(JWT_ISSUER,)
    .setAudience(JWT_AUDIENCE,)
    .setIssuedAt()
    .setExpirationTime(`${env.accessTokenTtlMinutes}m`,)
    .sign(accessTokenSecret,);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenClaims> {
  const { payload } =
    await jwtVerify(
      token,
      accessTokenSecret,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );

  const userId = Number(payload.sub);

  const role = payload.role as UserRole;

  if (
    !Number.isInteger(userId) || typeof payload.email !== "string" || !Object.values(UserRole).includes(role)
  ) {
    throw new Error("Invalid access token payload.",);
  }

  return {
    userId,
    email: payload.email,
    role,
  };
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(
  token: string,
) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRefreshTokenExpiry() {
  const milliseconds =
    env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

  return new Date(
    Date.now() + milliseconds,
  );
}