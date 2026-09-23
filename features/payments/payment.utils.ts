import type {
  PaymentStatus,
} from "@/features/payments/payment.types";

export const PAYMENT_STATUS_LABELS:
  Record<
    PaymentStatus,
    string
  > = {
  PENDING:
    "Pendiente",

  IN_PROCESS:
    "En proceso",

  APPROVED:
    "Aprobado",

  REJECTED:
    "Rechazado",

  CANCELLED:
    "Cancelado",

  REFUNDED:
    "Reembolsado",
};

export function getPaymentStatusClass(
  status:
    PaymentStatus,
) {
  switch (status) {
    case "APPROVED":
      return "payment-status-approved";

    case "PENDING":
    case "IN_PROCESS":
      return "payment-status-pending";

    case "REJECTED":
    case "CANCELLED":
      return "payment-status-error";

    case "REFUNDED":
      return "payment-status-refunded";
  }
}

export function isPaymentFinal(
  status:
    PaymentStatus,
) {
  return (
    status ===
      "APPROVED" ||
    status ===
      "REJECTED" ||
    status ===
      "CANCELLED" ||
    status ===
      "REFUNDED"
  );
}