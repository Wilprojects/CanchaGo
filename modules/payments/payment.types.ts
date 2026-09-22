import type {
  CourtType,
  PaymentStatus,
  ReservationStatus,
} from "@/generated/prisma/enums";

export interface CreatePaymentInput {
  reservationId: number;
}

export interface PaymentEntityShape {
  id: number;

  quotationId: string;

  reservationId: number;

  status: PaymentStatus;

  amount: {
    toString(): string;
  };

  currency: string;

  preferenceId:
    | string
    | null;

  initPoint:
    | string
    | null;

  providerPaymentId:
    | string
    | null;

  statusDetail:
    | string
    | null;

  paidAt:
    | Date
    | null;

  createdAt: Date;
  updatedAt: Date;

  reservation: {
    id: number;

    userId: number;

    status:
      ReservationStatus;

    startAt: Date;
    endAt: Date;

    expiresAt:
      | Date
      | null;

    court: {
      id: number;
      name: string;
      slug: string;
      type: CourtType;
    };
  };
}

export interface PaymentResponse {
  quotationId: string;

  reservation: {
    id: number;

    status:
      ReservationStatus;

    startAt: string;
    endAt: string;

    court: {
      id: number;
      name: string;
      slug: string;
      type: CourtType;
    };
  };

  status:
    PaymentStatus;

  amount: number;

  currency: string;

  preferenceId:
    | string
    | null;

  checkoutUrl:
    | string
    | null;

  providerPaymentId:
    | string
    | null;

  statusDetail:
    | string
    | null;

  paidAt:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}