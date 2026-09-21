import type {PublicUser, UserEntityShape,} from "@/modules/users/user.types";

export function toPublicUser(
  user: UserEntityShape,
): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}