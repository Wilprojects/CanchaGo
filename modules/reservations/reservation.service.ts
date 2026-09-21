import {
  Prisma,
} from "@/generated/prisma/client";

import {
  ReservationStatus,
} from "@/generated/prisma/enums";

import {
  env,
} from "@/lib/config/env";

import {
  ApiError,
} from "@/lib/http/api-error";

import {
  toReservationResponse,
} from "@/modules/reservations/reservation.mapper";

import {
  reservationRepository,
  withSerializableReservationTransaction,
} from "@/modules/reservations/reservation.repository";

import type {
  CreateReservationInput,
  ListReservationsQuery,
  UpdateReservationInput,
} from "@/modules/reservations/reservation.types";

import {
  validateReservationWindow,
} from "@/modules/reservations/reservation-window";


function createHoldExpiration(
  now: Date,
) {
  return new Date(
    now.getTime() +
      env.reservationHoldMinutes *
        60 *
        1000,
  );
}

function isSerializableConflict(
  error: unknown,
) {
  return (
    error instanceof
      Prisma
        .PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

function calculateDurationHours(
  startAt: Date,
  endAt: Date,
) {
  return (
    endAt.getTime() -
    startAt.getTime()
  ) /
    (60 * 60 * 1000);
}

async function expirePendingReservations(
  now: Date,
) {
  await reservationRepository
    .expirePendingReservations(
      now,
    );
}

function reservationNotFound() {
  return new ApiError(
    404,
    "La reserva no existe.",
    "RESERVATION_NOT_FOUND",
  );
}


export const reservationService = {
    async listMine(
    userId: number,
    query: ListReservationsQuery,
    ) {
    const now =
        new Date();

    await expirePendingReservations(
        now,
    );

    const [
        reservations,
        total,
    ] =
        await Promise.all([
        reservationRepository
            .findManyByUser(
            userId,
            query,
            ),

        reservationRepository
            .countByUser(
            userId,
            query,
            ),
        ]);

    return {
        items:
        reservations.map(
            toReservationResponse,
        ),

        pagination: {
        page:
            query.page,

        limit:
            query.limit,

        total,

        totalPages:
            Math.ceil(
            total /
                query.limit,
            ),
        },
    };
    },

    async getMineById(
    userId: number,
    id: number,
    ) {
    const now =
        new Date();

    await expirePendingReservations(
        now,
    );

    const reservation =
        await reservationRepository
        .findByIdForUser(
            id,
            userId,
        );

    if (!reservation) {
        throw reservationNotFound();
    }

    return toReservationResponse(
        reservation,
    );
    },


    async create(
    userId: number,
    input:
        CreateReservationInput,
    ) {
    const now =
        new Date();

    await expirePendingReservations(
        now,
    );

    const {
        durationHours,
    } =
        validateReservationWindow(
        input,
        now,
        );

    try {
        return await
        withSerializableReservationTransaction(
            async (
            repository,
            ) => {
            const court =
                await repository
                .findActiveCourtById(
                    input.courtId,
                );

            if (!court) {
                throw new ApiError(
                404,
                "La cancha no existe o no está activa.",
                "COURT_NOT_FOUND",
                );
            }

            const conflict =
                await repository
                .findBlockingReservation({
                    courtId:
                    input.courtId,

                    startAt:
                    input.startAt,

                    endAt:
                    input.endAt,

                    now,
                });

            if (conflict) {
                throw new ApiError(
                409,
                "La cancha ya no se encuentra disponible en el horario solicitado.",
                "COURT_NOT_AVAILABLE",
                );
            }

            const pricePerHour =
                Number(
                court
                    .pricePerHour
                    .toString(),
                );

            const totalPrice =
                Number(
                (
                    pricePerHour *
                    durationHours
                ).toFixed(2),
                );

            const expiresAt =
                createHoldExpiration(
                now,
                );

            const reservation =
                await repository
                .createPending({
                    userId,

                    courtId:
                    input.courtId,

                    startAt:
                    input.startAt,

                    endAt:
                    input.endAt,

                    totalPrice,

                    expiresAt,
                });

            return toReservationResponse(
                reservation,
            );
            },
        );
    } catch (error) {
        if (
        isSerializableConflict(
            error,
        )
        ) {
        throw new ApiError(
            409,
            "La disponibilidad cambió mientras se procesaba la reserva. Intenta nuevamente.",
            "RESERVATION_CONCURRENCY_CONFLICT",
        );
        }

        throw error;
    }
    },

    async cancel(
    userId: number,
    id: number,
    ) {
    const now =
        new Date();

    await expirePendingReservations(
        now,
    );

    const reservation =
        await reservationRepository
        .findByIdForUser(
            id,
            userId,
        );

    if (!reservation) {
        throw reservationNotFound();
    }

    if (
        reservation.status ===
        ReservationStatus.CANCELLED
    ) {
        return toReservationResponse(
        reservation,
        );
    }

    if (
        reservation.status ===
        ReservationStatus.EXPIRED
    ) {
        throw new ApiError(
        409,
        "Una reserva expirada no puede cancelarse.",
        "RESERVATION_EXPIRED",
        );
    }

    if (
        reservation.startAt.getTime() <=
        now.getTime()
    ) {
        throw new ApiError(
        409,
        "No se puede cancelar una reserva que ya comenzó o pertenece al pasado.",
        "RESERVATION_ALREADY_STARTED",
        );
    }

    const updated =
        await reservationRepository
        .update(
            id,
            {
            status:
                ReservationStatus
                .CANCELLED,

            expiresAt:
                null,
            },
        );

    return toReservationResponse(
        updated,
    );
    },


    async reschedule(
    userId: number,
    id: number,
    startAt: Date,
    endAt: Date,
    ) {
    const now =
        new Date();

    await expirePendingReservations(
        now,
    );

    const {
        durationHours,
    } =
        validateReservationWindow(
        {
            startAt,
            endAt,
        },
        now,
        );

    try {
        return await
        withSerializableReservationTransaction(
            async (
            repository,
            ) => {
            const reservation =
                await repository
                .findByIdForUser(
                    id,
                    userId,
                );

            if (!reservation) {
                throw reservationNotFound();
            }

            if (
                reservation.status ===
                ReservationStatus
                    .CANCELLED ||
                reservation.status ===
                ReservationStatus
                    .EXPIRED
            ) {
                throw new ApiError(
                409,
                "Esta reserva no puede reprogramarse en su estado actual.",
                "RESERVATION_CANNOT_BE_RESCHEDULED",
                );
            }

            if (
                reservation
                .startAt
                .getTime() <=
                now.getTime()
            ) {
                throw new ApiError(
                409,
                "No se puede reprogramar una reserva que ya comenzó o pertenece al pasado.",
                "RESERVATION_ALREADY_STARTED",
                );
            }

            const conflict =
                await repository
                .findBlockingReservation({
                    courtId:
                    reservation
                        .courtId,

                    startAt,
                    endAt,

                    now,

                    excludeReservationId:
                    reservation.id,
                });

            if (conflict) {
                throw new ApiError(
                409,
                "La cancha no está disponible en el nuevo horario.",
                "COURT_NOT_AVAILABLE",
                );
            }

            let totalPrice =
                Number(
                reservation
                    .totalPrice
                    .toString(),
                );

            let status: ReservationStatus = ReservationStatus.RESCHEDULED;

            let expiresAt:
                Date | null =
                null;

            if (
                reservation.status ===
                ReservationStatus
                .PENDING_PAYMENT
            ) {
                const pricePerHour =
                Number(
                    reservation
                    .court
                    .pricePerHour
                    .toString(),
                );

                totalPrice =
                Number(
                    (
                    pricePerHour *
                    durationHours
                    ).toFixed(2),
                );

                status = ReservationStatus.PENDING_PAYMENT;

                expiresAt =
                createHoldExpiration(
                    now,
                );
            } else {
                const originalDuration =
                calculateDurationHours(
                    reservation.startAt,
                    reservation.endAt,
                );

                if (
                originalDuration !==
                durationHours
                ) {
                throw new ApiError(
                    409,
                    "Una reserva ya confirmada solo puede reprogramarse manteniendo la misma duración.",
                    "RESCHEDULE_DURATION_CHANGE_NOT_ALLOWED",
                );
                }
            }

            const updated =
                await repository
                .update(
                    id,
                    {
                    startAt,
                    endAt,
                    status,
                    totalPrice,
                    expiresAt,
                    },
                );

            return toReservationResponse(
                updated,
            );
            },
        );
    } catch (error) {
        if (
        isSerializableConflict(
            error,
        )
        ) {
        throw new ApiError(
            409,
            "La disponibilidad cambió mientras se reprogramaba la reserva.",
            "RESERVATION_CONCURRENCY_CONFLICT",
        );
        }

        throw error;
    }
    },

    async update(
    userId: number,
    id: number,
    input:
        UpdateReservationInput,
    ) {
    if (
        input.action ===
        "CANCEL"
    ) {
        return this.cancel(
        userId,
        id,
        );
    }

    if (
        !input.startAt ||
        !input.endAt
    ) {
        throw new ApiError(
        400,
        "Debe indicar el nuevo horario de la reserva.",
        "RESCHEDULE_TIME_REQUIRED",
        );
    }

    return this.reschedule(
        userId,
        id,
        input.startAt,
        input.endAt,
    );
    },
}