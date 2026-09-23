import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

import {
  env,
} from "@/lib/config/env";

import {
  paymentService,
} from "@/modules/payments/payment.service";

interface PaymentReturnRouteProps {
  params:
    Promise<{
      result: string;
    }>;
}

export async function GET(
  request:
    NextRequest,

  {
    params,
  }:
    PaymentReturnRouteProps,
) {
  const {
    result,
  } =
    await params;

  if (
    result !== "success" &&
    result !== "pending" &&
    result !== "failure"
  ) {
    return NextResponse.redirect(
      new URL(
        "/intranet/reservas",
        env.publicAppUrl,
      ),
    );
  }

  const paymentId =
    request.nextUrl
      .searchParams
      .get("payment_id");

  /*
   * Reconciliación de seguridad.
   *
   * NO confiamos en:
   * ?status=approved
   *
   * Si Mercado Pago entrega un payment_id,
   * consultamos el pago real a Mercado Pago
   * desde nuestro backend.
   *
   * processWebhookPayment() ya realiza las
   * validaciones de proveedor y actualiza
   * Payment + Reservation.
   */
  if (
    paymentId &&
    result === "success"
  ) {
    try {
      console.log(
        "[MP_RETURN_RECONCILIATION]",
        {
          paymentId,
        },
      );

      await paymentService
        .processWebhookPayment(
          paymentId,
        );

      console.log(
        "[MP_RETURN_RECONCILIATION_OK]",
        {
          paymentId,
        },
      );
    } catch (error) {
      /*
       * No bloqueamos el retorno del usuario.
       *
       * El frontend podrá seguir consultando
       * el Payment y el webhook podrá
       * reintentarse posteriormente.
       */
      console.error(
        "[MP_RETURN_RECONCILIATION_ERROR]",
        {
          paymentId,
          error,
        },
      );
    }
  }

  const target =
    new URL(
      `/intranet/pagos/resultado/${result}`,
      env.publicAppUrl,
    );

  request.nextUrl
    .searchParams
    .forEach(
      (
        value,
        key,
      ) => {
        target.searchParams
          .append(
            key,
            value,
          );
      },
    );

  return NextResponse.redirect(
    target,
  );
}