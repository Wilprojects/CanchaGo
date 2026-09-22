import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  AuthUser,
  LoginInput,
  LoginResult,
  RegisterInput,
} from "@/features/auth/auth.types";

type UserPayload =
  | AuthUser
  | {
      user: AuthUser;
    };

function extractUser(
  payload: UserPayload,
): AuthUser {
  if (
    "user" in payload
  ) {
    return payload.user;
  }

  return payload;
}

export async function loginUser(
  input: LoginInput,
) {
  return apiFetch<LoginResult>(
    "/api/users/login",
    {
      method: "POST",

      body:
        JSON.stringify(
          input,
        ),

      retryOnUnauthorized:
        false,
    },
  );
}

export async function registerUser(
  input: RegisterInput,
) {
  await apiFetch<unknown>(
    "/api/users/register",
    {
      method: "POST",

      body:
        JSON.stringify(
          input,
        ),

      retryOnUnauthorized:
        false,
    },
  );
}

export async function getCurrentUser(
  signal?: AbortSignal,
) {
  const data =
    await apiFetch<UserPayload>(
      "/api/users/me",
      {
        method: "GET",
        signal,
      },
    );

  return extractUser(
    data,
  );
}

export async function logoutUser() {
  await apiFetch<unknown>(
    "/api/auth/logout",
    {
      method: "POST",

      retryOnUnauthorized:
        false,
    },
  );
}