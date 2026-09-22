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

export interface ApiFetchOptions
  extends RequestInit {
  retryOnUnauthorized?: boolean;
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

    this.name =
      "ApiClientError";

    this.statusCode =
      statusCode;

    this.code =
      code;

    this.details =
      details;
  }
}

export function isAbortError(
  error: unknown,
): boolean {
  return (
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

let refreshPromise:
  | Promise<boolean>
  | null = null;

async function tryRefreshSession():
  Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (!refreshPromise) {
    refreshPromise =
      fetch(
        "/api/auth/refresh",
        {
          method: "POST",
          credentials: "include",
        },
      )
        .then(
          (response) =>
            response.ok,
        )
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
  }

  return refreshPromise;
}

async function executeRequest(
  url: string,
  options: RequestInit,
) {
  try {
    return await fetch(
      url,
      options,
    );
  } catch (error) {
    if (
      isAbortError(error)
    ) {
      throw error;
    }

    throw new ApiClientError(
      0,
      "No se pudo conectar con el servidor.",
      "NETWORK_ERROR",
    );
  }
}

export async function apiFetch<T>(
  url: string,
  options:
    ApiFetchOptions = {},
): Promise<T> {
  const {
    retryOnUnauthorized =
      true,

    ...requestOptions
  } = options;

  const headers =
    new Headers(
      requestOptions.headers,
    );

  if (
    requestOptions.body &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const fetchOptions:
    RequestInit = {
    ...requestOptions,

    headers,

    credentials:
      "include",
  };

  let response =
    await executeRequest(
      url,
      fetchOptions,
    );

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    url !==
      "/api/auth/refresh"
  ) {
    const refreshed =
      await tryRefreshSession();

    if (
      refreshed &&
      !requestOptions
        .signal
        ?.aborted
    ) {
      response =
        await executeRequest(
          url,
          fetchOptions,
        );
    }
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  let payload:
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null = null;

  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorPayload =
      payload as
        | ApiErrorResponse
        | null;

    throw new ApiClientError(
      response.status,

      errorPayload
        ?.error
        ?.message ??
        "Ocurrió un error al procesar la solicitud.",

      errorPayload
        ?.error
        ?.code ??
        "API_ERROR",

      errorPayload
        ?.error
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