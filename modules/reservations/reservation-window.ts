import { ApiError } from "@/lib/http/api-error";
import {isSameBusinessDay, isWholeBusinessHour, isWithinBusinessHours,} from "@/lib/date/business-time";

const ALLOWED_DURATION_HOURS =  [1, 2] as const;

const ONE_HOUR_MS = 60 * 60 * 1000;

interface ReservationWindow {
  startAt: Date;
  endAt: Date;
}

export function validateReservationWindow(
  window: ReservationWindow,
  now = new Date(),
) {
  if (
    window.startAt.getTime() <=
    now.getTime()
  ) {
    throw new ApiError(
      400,
      "La fecha y hora de inicio deben estar en el futuro.",
      "START_TIME_IN_PAST",
    );
  }

  if (
    window.endAt.getTime() <=
    window.startAt.getTime()
  ) {
    throw new ApiError(
      400,
      "La hora de fin debe ser posterior a la hora de inicio.",
      "INVALID_TIME_RANGE",
    );
  }

  if (
    !isSameBusinessDay(
      window.startAt,
      window.endAt,
    )
  ) {
    throw new ApiError(
      400,
      "La reserva debe iniciar y finalizar el mismo día.",
      "RESERVATION_MUST_BE_SAME_DAY",
    );
  }

  if (
    !isWholeBusinessHour(
      window.startAt,
    ) ||
    !isWholeBusinessHour(
      window.endAt,
    )
  ) {
    throw new ApiError(
      400,
      "Las reservas deben comenzar y terminar en horas exactas.",
      "INVALID_TIME_SLOT",
    );
  }

  const durationHours =
    (
      window.endAt.getTime() -
      window.startAt.getTime()
    ) /
    ONE_HOUR_MS;

  if (
    !ALLOWED_DURATION_HOURS.includes(
      durationHours as 1 | 2,
    )
  ) {
    throw new ApiError(
      400,
      "La duración de la reserva debe ser de 1 o 2 horas.",
      "INVALID_RESERVATION_DURATION",
    );
  }

  if (
    !isWithinBusinessHours(
      window.startAt,
      window.endAt,
    )
  ) {
    throw new ApiError(
      400,
      "El horario solicitado se encuentra fuera del horario de atención.",
      "OUTSIDE_BUSINESS_HOURS",
    );
  }

  return {
    durationHours,
  };
}