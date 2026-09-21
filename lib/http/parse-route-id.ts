import {ApiError,} from "@/lib/http/api-error";

export function parseRouteId(
  value: string,
  parameterName = "id",
): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0
  ) {
    throw new ApiError(400, `El parámetro ${parameterName} debe ser un número entero positivo.`, "INVALID_ROUTE_PARAMETER",);
  }

  return id;
}