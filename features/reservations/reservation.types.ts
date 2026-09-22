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
  status:ReservationStatus;
  totalPrice: number;
  expiresAt:| string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReservationListData {
  items: Reservation[];
  pagination: ReservationPagination;
}

export interface ListReservationsParams {
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}

export type UpdateReservationInput = | {
      action: "CANCEL";
    } | {
      action: "RESCHEDULE";
      startAt: string;
      endAt: string;
    };