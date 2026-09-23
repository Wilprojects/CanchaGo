import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

import {
  env,
} from "@/lib/config/env";

import {
  ApiError,
} from "@/lib/http/api-error";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  paymentService,
} from "@/modules/payments/payment.service";

interface MercadoPagoWebhookBody {
  type?: string;

  action?: string;

  data?: {
    id?:
      | string
      | number;
  };

  topic?: string;

  resource?: string;
}

export const runtime =
  "nodejs";

export const POST =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      /*
       * ============================================
       * 1. Detectar notificaciones IPN legacy
       * ============================================
       *
       * Las notificaciones IPN antiguas suelen llegar
       * con:
       *
       * ?id=...
       * &topic=merchant_order
       *
       * No deben procesarse utilizando el Webhook
       * Secret porque no son nuestro Webhook firmado.
       */

      const legacyTopic =
        request
          .nextUrl
          .searchParams
          .get(
            "topic",
          );

      const legacyId =
        request
          .nextUrl
          .searchParams
          .get(
            "id",
          );

      if (
        legacyTopic ||
        legacyId
      ) {
        console.log(
          "[MP_LEGACY_IPN_IGNORED]",
          {
            topic:
              legacyTopic,

            id:
              legacyId,
          },
        );

        return NextResponse
          .json(
            {
              received:
                true,

              ignored:
                true,

              reason:
                "legacy_ipn",
            },
            {
              status:
                200,
            },
          );
      }

      /*
       * ============================================
       * 2. Obtener información del Webhook firmado
       * ============================================
       */

      const xSignature =
        request.headers.get(
          "x-signature",
        );

      const xRequestId =
        request.headers.get(
          "x-request-id",
        );

      const dataId =
        request
          .nextUrl
          .searchParams
          .get(
            "data.id",
          );

      const queryType =
        request
          .nextUrl
          .searchParams
          .get(
            "type",
          );

      console.log(
        "[MP_WEBHOOK_RECEIVED]",
        {
          hasSignature:
            Boolean(
              xSignature,
            ),

          hasRequestId:
            Boolean(
              xRequestId,
            ),

          dataId,

          type:
            queryType,

          secretConfigured:
            Boolean(
              env
                .mercadoPagoWebhookSecret,
            ),

          secretLength:
            env
              .mercadoPagoWebhookSecret
              .length,
        },
      );

      /*
       * ============================================
       * 3. Validar campos necesarios para la firma
       * ============================================
       */

      if (
        !xSignature ||
        !xRequestId ||
        !dataId
      ) {
        throw new ApiError(
          400,
          "La notificación de Mercado Pago no contiene los datos necesarios para validar la firma.",
          "WEBHOOK_SIGNATURE_DATA_REQUIRED",
        );
      }

      /*
       * ============================================
       * 4. Validar firma mediante SDK oficial
       * ============================================
       */

      try {
        WebhookSignatureValidator
          .validate({
            xSignature,

            xRequestId,

            dataId,

            secret:
              env
                .mercadoPagoWebhookSecret,
          });
      } catch (error) {
        if (
          error instanceof
            InvalidWebhookSignatureError
        ) {
          console.warn(
            "[MP_WEBHOOK_INVALID_SIGNATURE]",
            {
              dataId,

              hasSignature:
                true,

              hasRequestId:
                true,

              secretConfigured:
                true,

              secretLength:
                env
                  .mercadoPagoWebhookSecret
                  .length,
            },
          );

          throw new ApiError(
            401,
            "Firma de webhook inválida.",
            "INVALID_WEBHOOK_SIGNATURE",
          );
        }

        console.error(
          "[MP_WEBHOOK_SIGNATURE_ERROR]",
          error,
        );

        throw error;
      }

      console.log(
        "[MP_WEBHOOK_SIGNATURE_VALID]",
        {
          dataId,
        },
      );

      /*
       * ============================================
       * 5. Leer body
       * ============================================
       */

      let body:
        MercadoPagoWebhookBody =
        {};

      try {
        body =
          await request.json();
      } catch {
        body = {};
      }

      /*
       * ============================================
       * 6. Determinar el tipo de evento
       * ============================================
       */

      const type =
        queryType ??
        body.type;

      /*
       * Nuestro sistema solamente procesa
       * notificaciones relacionadas con Payment.
       */

      if (
        type &&
        type !==
          "payment"
      ) {
        console.log(
          "[MP_WEBHOOK_IGNORED]",
          {
            type,

            action:
              body.action ??
              null,
          },
        );

        return NextResponse
          .json(
            {
              received:
                true,

              ignored:
                true,
            },
            {
              status:
                200,
            },
          );
      }

      /*
       * ============================================
       * 7. Payment ID
       * ============================================
       */

      const paymentId =
        dataId;

      console.log(
        "[MP_WEBHOOK_PROCESSING]",
        {
          paymentId,

          type,

          action:
            body.action ??
            null,
        },
      );

      /*
       * ============================================
       * 8. Consultar Mercado Pago y sincronizar DB
       * ============================================
       */

      const result =
        await paymentService
          .processWebhookPayment(
            paymentId,
          );

      console.log(
        "[MP_WEBHOOK_PROCESSED]",
        {
          paymentId,
        },
      );

      /*
       * ============================================
       * 9. Responder 200 a Mercado Pago
       * ============================================
       */

      return NextResponse
        .json(
          {
            received:
              true,

            ...result,
          },
          {
            status:
              200,
          },
        );
    },
  );