import type {
  PaymentEntityShape,
  PaymentResponse,
} from "@/modules/payments/payment.types";

export function toPaymentResponse(
  payment:
    PaymentEntityShape,
): PaymentResponse {
  return {
    quotationId:
      payment.quotationId,

    reservation: {
      id:
        payment
          .reservation.id,

      status:
        payment
          .reservation.status,

      startAt:
        payment
          .reservation
          .startAt
          .toISOString(),

      endAt:
        payment
          .reservation
          .endAt
          .toISOString(),

      court: {
        id:
          payment
            .reservation
            .court.id,

        name:
          payment
            .reservation
            .court.name,

        slug:
          payment
            .reservation
            .court.slug,

        type:
          payment
            .reservation
            .court.type,
      },
    },

    status:
      payment.status,

    amount:
      Number(
        payment.amount
          .toString(),
      ),

    currency:
      payment.currency,

    preferenceId:
      payment.preferenceId,

    checkoutUrl:
      payment.initPoint,

    providerPaymentId:
      payment.providerPaymentId,

    statusDetail:
      payment.statusDetail,

    paidAt:
      payment.paidAt
        ?.toISOString() ??
      null,

    createdAt:
      payment.createdAt
        .toISOString(),

    updatedAt:
      payment.updatedAt
        .toISOString(),
  };
}