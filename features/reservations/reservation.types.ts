import type {
  CourtType,
} from "@/features/courts/court.types";

export type ReservationStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "EXPIRED";

export interface CreateReservationInput {
  courtId: number;

  startAt: string;

  endAt: string;
}

export interface Reservation {
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

  status:
    ReservationStatus;

  totalPrice: number;

  expiresAt:
    | string
    | null;

  createdAt: string;

  updatedAt: string;
}