import { ApiError } from "@/lib/http/api-error";
import { env } from "@/lib/config/env";

import {authRepository,} from "@/modules/auth/auth.repository";

import {createRefreshToken, createRefreshTokenExpiry, hashRefreshToken, signAccessToken,} from "@/modules/auth/auth.tokens";

import {hashPassword, verifyPassword,} from "@/modules/auth/auth.password";

import type {AuthSessionResult, LoginInput, RegisterInput,} from "@/modules/auth/auth.types";

import {toPublicUser,} from "@/modules/users/user.mapper";

import {userRepository,} from "@/modules/users/user.repository";

async function createSession(user: Awaited<ReturnType<typeof userRepository.findById>>,): Promise<AuthSessionResult> {
  if (!user) {
    throw new ApiError(401, "Usuario no válido.", "INVALID_USER",);
  }

  const accessToken = await signAccessToken(user);

  const refreshToken = createRefreshToken();

  const refreshExpiresAt = createRefreshTokenExpiry();

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken,),
    expiresAt: refreshExpiresAt,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    refreshExpiresAt,
    expiresIn: env.accessTokenTtlMinutes * 60,
  };
}

export const authService = {
    async register(input: RegisterInput,) {
        const existingUser = await userRepository.findByEmail(
            input.email,
        );

        if (existingUser) {
            throw new ApiError(409, "Ya existe un usuario registrado con ese correo electrónico.", "EMAIL_ALREADY_REGISTERED",);
        }

        const passwordHash = await hashPassword(
            input.password,
        );

        const user = await userRepository.create({
            name: input.name,
            email: input.email,
            passwordHash,
        });

        return toPublicUser(user);
    },

  async login(input: LoginInput,): Promise<AuthSessionResult> {
    const user = await userRepository.findByEmail(input.email,);

    if (!user) {
      throw new ApiError(401, "Correo electrónico o contraseña incorrectos.", "INVALID_CREDENTIALS",);
    }

    const validPassword = await verifyPassword(
        input.password,
        user.passwordHash,
      );

    if (!validPassword) {
      throw new ApiError(401, "Correo electrónico o contraseña incorrectos.","INVALID_CREDENTIALS",);
    }

    return createSession(user);
  },

  async refreshSession(refreshToken: string,): Promise<AuthSessionResult> {
    const currentTokenHash = hashRefreshToken(refreshToken,);

    const storedToken = await authRepository.findRefreshTokenByHash(currentTokenHash,);

    if (
      !storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()
    ) {
      throw new ApiError(401, "El refresh token no es válido o ha expirado.", "INVALID_REFRESH_TOKEN",);
    }

    const newRefreshToken = createRefreshToken();

    const newRefreshExpiresAt = createRefreshTokenExpiry();

    const rotated = await authRepository.rotateRefreshToken(
        storedToken.id,
        {
          userId: storedToken.userId,
          tokenHash: hashRefreshToken(newRefreshToken,),
          expiresAt: newRefreshExpiresAt,
        },
      );

    if (!rotated) {
      throw new ApiError(401, "El refresh token ya no es válido.", "INVALID_REFRESH_TOKEN",);
    }

    const accessToken = await signAccessToken(storedToken.user,);

    return {
      user: toPublicUser(storedToken.user,),
      accessToken,
      refreshToken: newRefreshToken,
      refreshExpiresAt: newRefreshExpiresAt,
      expiresIn: env.accessTokenTtlMinutes * 60,
    };
  },

  async logout(refreshToken:  string | null,) {
    if (!refreshToken) {
      return;
    }

    await authRepository
      .revokeRefreshTokenByHash(
        hashRefreshToken(
          refreshToken,
        ),
      );
  },
};