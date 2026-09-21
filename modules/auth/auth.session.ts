import type {NextRequest,} from "next/server";
import { ApiError } from "@/lib/http/api-error";
import {getAccessTokenFromRequest,} from "@/modules/auth/auth.cookies";
import {verifyAccessToken,} from "@/modules/auth/auth.tokens";
import {toPublicUser,} from "@/modules/users/user.mapper";
import {userRepository,} from "@/modules/users/user.repository";

export async function requireApiSession(
  request: NextRequest,
) {
  const accessToken = getAccessTokenFromRequest(request,);

  if (!accessToken) {
    throw new ApiError(401, "Debes iniciar sesión.", "UNAUTHORIZED",);
  }

  let claims;

  try {
    claims = await verifyAccessToken(accessToken,);
  } catch {
    throw new ApiError(401, "La sesión no es válida o ha expirado.", "INVALID_ACCESS_TOKEN",);
  }

  const user = await userRepository.findById(claims.userId,);

  if (!user) {
    throw new ApiError(401, "La sesión no corresponde a un usuario válido.", "INVALID_SESSION",);
  }

  return {
    user: toPublicUser(user),
  };
}