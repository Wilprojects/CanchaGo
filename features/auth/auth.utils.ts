import type {
  AuthUser,
} from "@/features/auth/auth.types";

export function getHomeForUser(
  user: AuthUser,
) {
  return user.role ===
    "ADMIN"
    ? "/backoffice"
    : "/intranet";
}

export function getPostLoginPath(
  user: AuthUser,
  requestedPath?: string,
) {
  if (
    requestedPath
      ?.startsWith(
        "/intranet",
      ) &&
    user.role === "USER"
  ) {
    return requestedPath;
  }

  if (
    requestedPath
      ?.startsWith(
        "/backoffice",
      ) &&
    user.role === "ADMIN"
  ) {
    return requestedPath;
  }

  return getHomeForUser(
    user,
  );
}