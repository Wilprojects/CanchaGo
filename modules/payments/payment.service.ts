import {
  PaymentStatus,
  ReservationStatus,
} from "@/generated/prisma/enums";

import {
  ApiError,
} from "@/lib/http/api-error";

import {
  isUuid,
} from "@/lib/http/parse-route-uuid";

import {
  toPaymentResponse,
} from "@/modules/payments/payment.mapper";

import {
  createMercadoPagoPreference,
  getMercadoPagoPayment,
} from "@/modules/payments/payment.provider";

import {
  paymentRepository,
} from "@/modules/payments/payment.repository";

import type {
  CreatePaymentInput,
} from "@/modules/payments/payment.types";


function mapMercadoPagoStatus(
  status:
    | string
    | undefined,
):
  | PaymentStatus
  | null {
  switch (status) {
    case "approved":
      return PaymentStatus
        .APPROVED;

    case "pending":
      return PaymentStatus
        .PENDING;

    case "in_process":
    case "authorized":
      return PaymentStatus
        .IN_PROCESS;

    case "rejected":
      return PaymentStatus
        .REJECTED;

    case "cancelled":
      return PaymentStatus
        .CANCELLED;

    case "refunded":
      return PaymentStatus
        .REFUNDED;

    default:
      return null;
  }
}

function toCents(
  amount: number,
) {
  return Math.round(
    amount * 100,
  );
}


export const paymentService = {
    async startCheckout(
    user: {
        id: number;
        email: string;
    },

    input:
        CreatePaymentInput,
    ) {
    const reservation =
        await paymentRepository
        .findReservationForPayment(
            input.reservationId,
            user.id,
        );

    if (!reservation) {
        throw new ApiError(
        404,
        "La reserva no existe.",
        "RESERVATION_NOT_FOUND",
        );
    }

    const now =
        new Date();

    if (
        reservation.status !==
        ReservationStatus
        .PENDING_PAYMENT
    ) {
        throw new ApiError(
        409,
        "La reserva no se encuentra pendiente de pago.",
        "RESERVATION_NOT_PAYABLE",
        );
    }

    if (
        !reservation.expiresAt ||
        reservation
        .expiresAt
        .getTime() <=
        now.getTime()
    ) {
        await paymentRepository
        .expireReservation(
            reservation.id,
            now,
        );

        throw new ApiError(
        409,
        "La reserva ha expirado. Debes crear una nueva reserva.",
        "RESERVATION_EXPIRED",
        );
    }

    const reusableAttempt =
        await paymentRepository
        .findReusableAttempt(
            reservation.id,
        );

    if (reusableAttempt) {
        return {
        payment:
            toPaymentResponse(
            reusableAttempt,
            ),

        reused:
            true,
        };
    }

    const amount =
        Number(
        reservation
            .totalPrice
            .toString(),
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new ApiError(
        409,
        "La reserva tiene un importe inválido.",
        "INVALID_RESERVATION_AMOUNT",
        );
    }

    const attempt =
        await paymentRepository
        .createAttempt({
            reservationId:
            reservation.id,

            amount,

            currency:
            "PEN",
        });

    try {
        const checkout =
        await createMercadoPagoPreference({
            quotationId:
            attempt.quotationId,

            reservationId:
            reservation.id,

            courtName:
            reservation
                .court
                .name,

            payerEmail:
            user.email,

            amount,

            expiresAt:
            reservation
                .expiresAt,
        });

        const updated =
        await paymentRepository
            .updateCheckoutData(
            attempt.id,
            {
                preferenceId:
                checkout
                    .preferenceId,

                initPoint:
                checkout
                    .checkoutUrl,
            },
            );

        return {
        payment:
            toPaymentResponse(
            updated,
            ),

        reused:
            false,
        };
    } catch (error) {
        console.error(
        "[MERCADO_PAGO_PREFERENCE_ERROR]",
        error,
        );

        await paymentRepository
        .markAttemptFailed(
            attempt.id,
        );

        throw new ApiError(
        502,
        "No se pudo iniciar el checkout de Mercado Pago.",
        "PAYMENT_PROVIDER_ERROR",
        );
    }
    },

    async getMine(
    userId: number,
    quotationId: string,
    ) {
    const payment =
        await paymentRepository
        .findByQuotationIdForUser(
            quotationId,
            userId,
        );

    if (!payment) {
        throw new ApiError(
        404,
        "El pago no existe.",
        "PAYMENT_NOT_FOUND",
        );
    }

    return toPaymentResponse(
        payment,
    );
    },

  async processWebhookPayment(
    providerPaymentId:
        string,
    ) {
    let providerPayment;

    try {
        providerPayment =
        await getMercadoPagoPayment(
            providerPaymentId,
        );
    } catch (error) {
        console.error(
        "[MERCADO_PAGO_GET_PAYMENT_ERROR]",
        error,
        );

        throw new ApiError(
        502,
        "No se pudo verificar el pago con Mercado Pago.",
        "PAYMENT_PROVIDER_ERROR",
        );
    }

    const quotationId =
        providerPayment
        .external_reference
        ?.trim();

    if (
        !quotationId ||
        !isUuid(
        quotationId,
        )
    ) {
        return {
        processed:
            false,

        reason:
            "UNKNOWN_EXTERNAL_REFERENCE",
        };
    }

    const localPayment =
        await paymentRepository
        .findByQuotationId(
            quotationId,
        );

    if (!localPayment) {
        return {
        processed:
            false,

        reason:
            "PAYMENT_NOT_FOUND",
        };
    }

    const providerAmount =
        providerPayment
        .transaction_amount;

    if (
        providerAmount ===
        undefined
    ) {
        throw new ApiError(
        409,
        "Mercado Pago no devolvió el importe del pago.",
        "PAYMENT_AMOUNT_MISSING",
        );
    }

    const expectedAmount =
        Number(
        localPayment
            .amount
            .toString(),
        );

    if (
        toCents(
        providerAmount,
        ) !==
        toCents(
        expectedAmount,
        )
    ) {
        throw new ApiError(
        409,
        "El importe del pago no coincide con el importe esperado.",
        "PAYMENT_AMOUNT_MISMATCH",
        );
    }

    if (
        providerPayment.currency_id &&
        providerPayment.currency_id !==
        localPayment.currency
    ) {
        throw new ApiError(
        409,
        "La moneda del pago no coincide con la esperada.",
        "PAYMENT_CURRENCY_MISMATCH",
        );
    }

    const mappedStatus =
        mapMercadoPagoStatus(
        providerPayment.status,
        );

    const finalStatus =
        mappedStatus ??
        localPayment.status;

    const paidAt =
        providerPayment
        .date_approved
        ? new Date(
            providerPayment
                .date_approved,
            )
        : null;

    const statusDetail =
        (
        providerPayment
            .status_detail ??
        providerPayment
            .status ??
        null
        )
        ?.slice(
            0,
            150,
        ) ??
        null;

    const providerId =
        String(
        providerPayment.id ??
        providerPaymentId,
        );

    const updated =
        await paymentRepository
        .applyProviderResult({
            quotationId,

            providerPaymentId:
            providerId,

            status:
            finalStatus,

            statusDetail,

            paidAt,

            processedAt:
            new Date(),
        });

    return {
        processed:
        true,

        providerStatus:
        providerPayment
            .status ??
        null,

        payment:
        updated
            ? toPaymentResponse(
                updated,
            )
            : null,
    };
  },

}