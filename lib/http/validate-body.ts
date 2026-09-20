import type { ObjectSchema } from "joi";

import { ApiError } from "@/lib/http/api-error";
import { formatValidationError } from "@/lib/http/format-validation-error";

export async function validateBody<T>(
  request: Request,
  schema: ObjectSchema<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(
      400,
      "El cuerpo de la petición debe contener un JSON válido.",
      "INVALID_JSON",
    );
  }

  const { value, error } = schema.validate(body, {
    abortEarly: false,
    allowUnknown: false,
    convert: true,
  });

  if (error) {
    throw new ApiError(
      400,
      "Los datos enviados no son válidos.",
      "VALIDATION_ERROR",
      formatValidationError(error),
    );
  }

  return value;
}