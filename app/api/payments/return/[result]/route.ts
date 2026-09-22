import {
  ApiError,
} from "@/lib/http/api-error";

import {
  apiSuccess,
} from "@/lib/http/api-response";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

interface ReturnRouteContext {
  params: Promise<{
    result:
      string;
  }>;
}

export const GET =
  withApiRoute(
    async (
      _request: Request,
      context:
        ReturnRouteContext,
    ) => {
      const {
        result,
      } =
        await context.params;

      if (
        result !==
          "success" &&
        result !==
          "pending" &&
        result !==
          "failure"
      ) {
        throw new ApiError(
          404,
          "Resultado de pago no reconocido.",
          "PAYMENT_RETURN_NOT_FOUND",
        );
      }

      return apiSuccess({
        result,

        message:
          "Retorno recibido desde Mercado Pago.",

        important:
          "Este retorno del navegador no confirma el pago. El estado definitivo se actualiza mediante Webhook.",
      });
    },
  );