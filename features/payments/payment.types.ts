export type PaymentStatus =
  | "PENDING"
  | "IN_PROCESS"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentResult =
  | "success"
  | "pending"
  | "failure";

export interface Payment {
  id: number;
  quotationId: string;
  reservationId: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
  preferenceId: | string | null;
  initPoint: | string | null;
  providerPaymentId: | string | null;
  statusDetail: | string | null;
  paidAt: | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  reservationId: number;
}

export interface CreatePaymentResult {
  payment: Payment;

  checkoutUrl: string;
}