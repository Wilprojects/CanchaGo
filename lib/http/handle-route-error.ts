import { NextResponse } from "next/server";

import { ApiError } from "@/lib/http/api-error";

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined
            ? { details: error.details }
            : {}),
        },
      },
      {
        status: error.statusCode,
      },
    );
  }

  console.error("[API_ERROR]", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error interno en el servidor.",
      },
    },
    {
      status: 500,
    },
  );
}