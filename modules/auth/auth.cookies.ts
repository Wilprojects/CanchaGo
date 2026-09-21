import type {NextRequest, NextResponse,} from "next/server";

import { env } from "@/lib/config/env";

export const ACCESS_TOKEN_COOKIE = "canchago_access_token";

export const REFRESH_TOKEN_COOKIE = "canchago_refresh_token";

const secure = process.env.NODE_ENV === "production";

export function getAccessTokenFromRequest(
  request: NextRequest,
): string | null {
  const authorization =
    request.headers.get("authorization",);

  if (authorization?.toLowerCase().startsWith("bearer ")
  ) {
    const token = authorization.slice(7).trim();

    if (token) {
      return token;
    }
  }

  return (request.cookies.get(ACCESS_TOKEN_COOKIE,)?.value ?? null);
}

export function getRefreshTokenFromRequest(
  request: NextRequest,
): string | null {
  return (
    request.cookies.get(
      REFRESH_TOKEN_COOKIE,
    )?.value ?? null
  );
}

export function setAuthCookies(
  response: NextResponse,
  data: {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
  },
) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: data.accessToken,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: env.accessTokenTtlMinutes * 60,
  });

  const refreshMaxAge =
    Math.max(
      0,
      Math.floor((data.refreshExpiresAt.getTime() - Date.now()) / 1000,
      ),
    );

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: data.refreshToken,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge,
  });
}

export function clearAuthCookies(
  response: NextResponse,
) {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}