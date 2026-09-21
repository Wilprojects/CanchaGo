import type { NextRequest } from "next/server";
import { UserRole } from "@/generated/prisma/enums";
import { ApiError } from "@/lib/http/api-error";
import {requireApiSession,} from "@/modules/auth/auth.session";

export async function requireRole(
  request: NextRequest,
  ...allowedRoles: UserRole[]
) {
  const session = await requireApiSession(request,);

  if (
    !allowedRoles.includes(session.user.role,)
  ) {
    throw new ApiError(403,"No tienes permisos para realizar esta operación.","FORBIDDEN",);
  }

  return session;
}

export function requireUser(
  request: NextRequest,
) {
  return requireRole(
    request,
    UserRole.USER,
  );
}

export function requireAdmin(
  request: NextRequest,
) {
  return requireRole(
    request,
    UserRole.ADMIN,
  );
}