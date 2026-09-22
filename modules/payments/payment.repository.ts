import {
  PaymentStatus,
  ReservationStatus,
} from "@/generated/prisma/enums";

import {
  prisma,
} from "@/lib/db/prisma";

export const paymentRepository = {
  findReservationForPayment(
    reservationId: number,
    userId: number,
  ) {
    return prisma.reservation
      .findFirst({
        where: {
          id:
            reservationId,

          userId,
        },

        include: {
          court:
            true,
        },
      });
  },

  expireReservation(
    reservationId: number,
    now: Date,
  ) {
    return prisma.reservation
      .updateMany({
        where: {
          id:
            reservationId,

          status:
            ReservationStatus
              .PENDING_PAYMENT,

          expiresAt: {
            lte:
              now,
          },
        },

        data: {
          status:
            ReservationStatus
              .EXPIRED,
        },
      });
  },

  findReusableAttempt(
    reservationId: number,
  ) {
    return prisma.payment
      .findFirst({
        where: {
          reservationId,

          status: {
            in: [
              PaymentStatus.PENDING,
              PaymentStatus.IN_PROCESS,
            ],
          },

          preferenceId: {
            not:
              null,
          },

          initPoint: {
            not:
              null,
          },
        },

        include: {
          reservation: {
            include: {
              court:
                true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });
  },

  createAttempt(
    data: {
      reservationId:
        number;

      amount:
        number;

      currency:
        string;
    },
  ) {
    return prisma.payment
      .create({
        data,

        include: {
          reservation: {
            include: {
              court:
                true,
            },
          },
        },
      });
  },

  updateCheckoutData(
    id: number,
    data: {
      preferenceId:
        string;

      initPoint:
        string;
    },
  ) {
    return prisma.payment
      .update({
        where: {
          id,
        },

        data,

        include: {
          reservation: {
            include: {
              court:
                true,
            },
          },
        },
      });
  },

  markAttemptFailed(
    id: number,
  ) {
    return prisma.payment
      .update({
        where: {
          id,
        },

        data: {
          status:
            PaymentStatus
              .CANCELLED,

          statusDetail:
            "PREFERENCE_CREATION_FAILED",
        },
      });
  },

  findByQuotationIdForUser(
    quotationId: string,
    userId: number,
  ) {
    return prisma.payment
      .findFirst({
        where: {
          quotationId,

          reservation: {
            userId,
          },
        },

        include: {
          reservation: {
            include: {
              court:
                true,
            },
          },
        },
      });
  },

  findByQuotationId(
    quotationId: string,
  ) {
    return prisma.payment
      .findUnique({
        where: {
          quotationId,
        },

        include: {
          reservation: {
            include: {
              court:
                true,
            },
          },
        },
      });
  },

  async applyProviderResult(
    input: {
      quotationId:
        string;

      providerPaymentId:
        string;

      status:
        PaymentStatus;

      statusDetail:
        string | null;

      paidAt:
        Date | null;

      processedAt:
        Date;
    },
  ) {
    return prisma.$transaction(
      async (tx) => {
        const current =
          await tx.payment
            .findUnique({
              where: {
                quotationId:
                  input
                    .quotationId,
              },

              include: {
                reservation:
                  true,
              },
            });

        if (!current) {
          return null;
        }

        if (
          current
            .providerPaymentId &&
          current
            .providerPaymentId !==
            input
              .providerPaymentId
        ) {
          throw new Error(
            "El intento de pago ya está asociado a otro providerPaymentId.",
          );
        }

        const providerOwner =
          await tx.payment
            .findUnique({
              where: {
                providerPaymentId:
                  input
                    .providerPaymentId,
              },
            });

        if (
          providerOwner &&
          providerOwner.id !==
            current.id
        ) {
          throw new Error(
            "El providerPaymentId ya está asociado a otro pago.",
          );
        }

        await tx.payment
          .update({
            where: {
              id:
                current.id,
            },

            data: {
              providerPaymentId:
                input
                  .providerPaymentId,

              status:
                input.status,

              statusDetail:
                input
                  .statusDetail,

              paidAt:
                input.paidAt,
            },
          });

        if (
          input.status ===
            PaymentStatus
              .APPROVED &&
          current
            .reservation
            .status ===
            ReservationStatus
              .PENDING_PAYMENT
        ) {
          const paidAt =
            input.paidAt ??
            input.processedAt;

          const expiresAt =
            current
              .reservation
              .expiresAt;

          if (
            expiresAt &&
            paidAt.getTime() <=
              expiresAt.getTime()
          ) {
            await tx.reservation
              .update({
                where: {
                  id:
                    current
                      .reservationId,
                },

                data: {
                  status:
                    ReservationStatus
                      .CONFIRMED,

                  expiresAt:
                    null,
                },
              });
          }
        }

        if (
          input.status ===
            PaymentStatus
              .REFUNDED &&
          (
            current
              .reservation
              .status ===
              ReservationStatus
                .CONFIRMED ||
            current
              .reservation
              .status ===
              ReservationStatus
                .RESCHEDULED
          )
        ) {
          await tx.reservation
            .update({
              where: {
                id:
                  current
                    .reservationId,
              },

              data: {
                status:
                  ReservationStatus
                    .CANCELLED,
              },
            });
        }

        return tx.payment
          .findUnique({
            where: {
              id:
                current.id,
            },

            include: {
              reservation: {
                include: {
                  court:
                    true,
                },
              },
            },
          });
      },
    );
  },
};