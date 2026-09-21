import {Prisma,} from "@/generated/prisma/client";
import {ReservationStatus,} from "@/generated/prisma/enums";
import {prisma,} from "@/lib/db/prisma";
import type {ListReservationsQuery,} from "@/modules/reservations/reservation.types";

type DatabaseClient = Pick<typeof prisma,"court" | "reservation">;

function createReservationRepository(
  db: DatabaseClient,
) {
  return {
    expirePendingReservations(
      now: Date,
    ) {
      return db.reservation.updateMany({
        where: {
          status:
            ReservationStatus
              .PENDING_PAYMENT,

          expiresAt: {
            lte: now,
          },
        },

        data: {
          status:
            ReservationStatus
              .EXPIRED,
        },
      });
    },

    findActiveCourtById(
      courtId: number,
    ) {
      return db.court.findFirst({
        where: {
          id:
            courtId,

          active:
            true,
        },
      });
    },

    findBlockingReservation(
      params: {
        courtId: number;
        startAt: Date;
        endAt: Date;
        now: Date;

        excludeReservationId?:
          number;
      },
    ) {
      return db.reservation.findFirst({
        where: {
          courtId:
            params.courtId,

          ...(params
            .excludeReservationId
            ? {
                id: {
                  not:
                    params
                      .excludeReservationId,
                },
              }
            : {}),

          startAt: {
            lt:
              params.endAt,
          },

          endAt: {
            gt:
              params.startAt,
          },

          OR: [
            {
              status: {
                in: [
                  ReservationStatus
                    .CONFIRMED,

                  ReservationStatus
                    .RESCHEDULED,
                ],
              },
            },

            {
              status:
                ReservationStatus
                  .PENDING_PAYMENT,

              OR: [
                {
                  expiresAt:
                    null,
                },

                {
                  expiresAt: {
                    gt:
                      params.now,
                  },
                },
              ],
            },
          ],
        },

        select: {
          id: true,
        },
      });
    },

    createPending(
      data: {
        userId: number;
        courtId: number;

        startAt: Date;
        endAt: Date;

        totalPrice: number;
        expiresAt: Date;
      },
    ) {
      return db.reservation.create({
        data: {
          ...data,

          status:
            ReservationStatus
              .PENDING_PAYMENT,
        },

        include: {
          court:
            true,
        },
      });
    },

    findManyByUser(
      userId: number,
      query:
        ListReservationsQuery,
    ) {
      return db.reservation.findMany({
        where: {
          userId,

          ...(query.status
            ? {
                status:
                  query.status,
              }
            : {}),
        },

        include: {
          court:
            true,
        },

        orderBy: {
          createdAt:
            "desc",
        },

        skip:
          (query.page - 1) *
          query.limit,

        take:
          query.limit,
      });
    },

    countByUser(
      userId: number,
      query:
        ListReservationsQuery,
    ) {
      return db.reservation.count({
        where: {
          userId,

          ...(query.status
            ? {
                status:
                  query.status,
              }
            : {}),
        },
      });
    },

    findByIdForUser(
      id: number,
      userId: number,
    ) {
      return db.reservation.findFirst({
        where: {
          id,
          userId,
        },

        include: {
          court:
            true,
        },
      });
    },

    update(
      id: number,
      data: {
        startAt?: Date;
        endAt?: Date;

        status?:
          ReservationStatus;

        totalPrice?: number;

        expiresAt?:
          Date | null;
      },
    ) {
      return db.reservation.update({
        where: {
          id,
        },

        data,

        include: {
          court:
            true,
        },
      });
    },
  };
}

export const reservationRepository =
  createReservationRepository(
    prisma,
  );

export function withSerializableReservationTransaction<T>(
  work: (
    repository:
      ReturnType<
        typeof createReservationRepository
      >,
  ) => Promise<T>,
) {
  return prisma.$transaction(
    async (transaction) =>
      work(
        createReservationRepository(
          transaction,
        ),
      ),

    {
      isolationLevel:
        Prisma
          .TransactionIsolationLevel
          .Serializable,
    },
  );
}