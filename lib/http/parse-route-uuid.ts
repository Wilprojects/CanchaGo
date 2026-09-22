import {ApiError,} from "@/lib/http/api-error";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(
  value: string,
) {
  return UUID_PATTERN.test(value,);
}

export function parseRouteUuid(
  value: string,
  parameterName = "quotationId",
) {
  if (!isUuid(value)) {
    throw new ApiError(400, `El parámetro ${parameterName} debe ser un UUID válido.`, "INVALID_ROUTE_PARAMETER",);
  }

  return value.toLowerCase();
}