interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;

  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code = "API_CLIENT_ERROR",
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function isAbortError(
  error: unknown,
): boolean {
  return (
    error instanceof
      DOMException &&
    error.name ===
      "AbortError"
  );
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(
      options.headers,
    );

  if (
    options.body &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          ...options,
          headers,

          credentials:
            "include",
        },
      );
  } catch (error) {
    if (
      isAbortError(
        error,
      )
    ) {
      throw error;
    }

    throw new ApiClientError(
      0,
      "No se pudo conectar con el servidor.",
      "NETWORK_ERROR",
    );
  }

  let payload:
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null =
    null;

  try {
    payload =
      await response.json();
  } catch {
    payload =
      null;
  }

  if (!response.ok) {
    const errorPayload =
      payload as
        | ApiErrorResponse
        | null;

    throw new ApiClientError(
      response.status,

      errorPayload?.error
        ?.message ??
        "Ocurrió un error al procesar la solicitud.",

      errorPayload?.error
        ?.code ??
        "API_ERROR",

      errorPayload?.error
        ?.details,
    );
  }

  const successPayload =
    payload as
      | ApiSuccessResponse<T>
      | null;

  if (
    !successPayload ||
    successPayload.success !==
      true
  ) {
    throw new ApiClientError(
      response.status,
      "La respuesta del servidor no tiene el formato esperado.",
      "INVALID_API_RESPONSE",
    );
  }

  return successPayload.data;
}