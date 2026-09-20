import type { ObjectSchema } from "joi";

import { ApiError } from "@/lib/http/api-error";
import { formatValidationError } from "@/lib/http/format-validation-error";

export function validateQuery<T>(
  request: Request,
  schema: ObjectSchema<T>,
): T {
  const url = new URL(request.url);

  const query = Object.fromEntries(
    url.searchParams.entries(),
  );

  const { value, error } = schema.validate(query, {
    abortEarly: false,
    allowUnknown: false,
    convert: true,
  });

  if (error) {
    throw new ApiError(
      400,
      "Los parámetros de consulta no son válidos.",
      "VALIDATION_ERROR",
      formatValidationError(error),
    );
  }

  return value;
}