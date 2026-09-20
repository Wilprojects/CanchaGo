import type { ValidationError } from "joi";

export interface ValidationErrorDetail {
  field: string;
  message: string;
  type: string;
}

export function formatValidationError(
  error: ValidationError,
): ValidationErrorDetail[] {
  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
    type: detail.type,
  }));
}