import type {CourtType, ReservationStatus,} from "@/generated/prisma/enums";

export interface CreateReservationInput {
  courtId: number;
  startAt: Date;
  endAt: Date;
}

export interface ListReservationsQuery {
  status?: ReservationStatus;
  page: number;
  limit: number;
}

export interface UpdateReservationInput {
  action:
    | "CANCEL"
    | "RESCHEDULE";

  startAt?: Date;
  endAt?: Date;
}

export interface ReservationEntityShape {
  id: number;
  userId: number;
  courtId: number;

  startAt: Date;
  endAt: Date;

  status: ReservationStatus;

  totalPrice: {
    toString(): string;
  };

  expiresAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  court: {
    id: number;
    name: string;
    slug: string;
    type: CourtType;

    pricePerHour: {
      toString(): string;
    };
  };
}

export interface ReservationResponse {
  id: number;

  court: {
    id: number;
    name: string;
    slug: string;
    type: CourtType;
    pricePerHour: number;
  };

  startAt: string;
  endAt: string;

  status: ReservationStatus;

  totalPrice: number;

  expiresAt: string | null;

  createdAt: string;
  updatedAt: string;
}