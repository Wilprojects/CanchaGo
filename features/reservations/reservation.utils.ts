import type {
  ReservationStatus,
} from "@/features/reservations/reservation.types";

const LIMA_TIME_ZONE = "America/Lima";
const LIMA_OFFSET = "-05:00";
export const BUSINESS_OPEN_HOUR = 6;
export const BUSINESS_CLOSE_HOUR = 23;
export type ReservationDuration = | 1 | 2;

export function getLimaToday() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          LIMA_TIME_ZONE,

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      },
    ).formatToParts(
      new Date(),
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day",
    )?.value;

  return `${year}-${month}-${day}`;
}

export function buildLimaIsoDateTime(
  date: string,
  hour: number,
) {
  const formattedHour =
    String(hour)
      .padStart(
        2,
        "0",
      );

  return (
    `${date}T` +
    `${formattedHour}:00:00` +
    LIMA_OFFSET
  );
}

export function buildReservationWindow(
  date: string,
  startHour: number,
  duration:
    ReservationDuration,
) {
  return {
    startAt:
      buildLimaIsoDateTime(
        date,
        startHour,
      ),

    endAt:
      buildLimaIsoDateTime(
        date,
        startHour +
          duration,
      ),
  };
}

export function getAvailableStartHours(
  duration:
    ReservationDuration,
) {
  const lastStartHour =
    BUSINESS_CLOSE_HOUR -
    duration;

  return Array.from(
    {
      length:
        lastStartHour -
        BUSINESS_OPEN_HOUR +
        1,
    },

    (_, index) =>
      BUSINESS_OPEN_HOUR +
      index,
  );
}

export function formatHour(
  hour: number,
) {
  return `${String(
    hour,
  ).padStart(
    2,
    "0",
  )}:00`;
}

export function isPastStartTime(
  date: string,
  hour: number,
) {
  const value =
    new Date(
      buildLimaIsoDateTime(
        date,
        hour,
      ),
    );

  return (
    value.getTime() <=
    Date.now()
  );
}

export function formatReservationDateTime(
  value: string,
) {
  return new Intl
    .DateTimeFormat(
      "es-PE",
      {
        timeZone:
          LIMA_TIME_ZONE,

        dateStyle:
          "medium",

        timeStyle:
          "short",
      },
    )
    .format(
      new Date(value),
    );
}

export const RESERVATION_STATUS_LABELS:
  Record<
    ReservationStatus,
    string
  > = {
  PENDING_PAYMENT:
    "Pendiente de pago",

  CONFIRMED:
    "Confirmada",

  CANCELLED:
    "Cancelada",

  RESCHEDULED:
    "Reprogramada",

  EXPIRED:
    "Expirada",
};

export function getReservationStatusClass(
  status:
    ReservationStatus,
) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "reservation-status-pending";

    case "CONFIRMED":
      return "reservation-status-confirmed";

    case "RESCHEDULED":
      return "reservation-status-rescheduled";

    case "CANCELLED":
      return "reservation-status-cancelled";

    case "EXPIRED":
      return "reservation-status-expired";
  }
}

export function getReservationDurationHours(
  startAt: string,
  endAt: string,
) {
  const start =
    new Date(
      startAt,
    ).getTime();

  const end =
    new Date(
      endAt,
    ).getTime();

  return (
    end -
    start
  ) /
    (
      60 *
      60 *
      1000
    );
}

export function canManageReservation(
  startAt: string,
  status:
    ReservationStatus,
) {
  if (
    status ===
      "CANCELLED" ||
    status ===
      "EXPIRED"
  ) {
    return false;
  }

  return (
    new Date(
      startAt,
    ).getTime() >
    Date.now()
  );
}