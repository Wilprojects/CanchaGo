import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  Payment,
} from "@/features/payments/payment.types";

export function createPayment(
  input:
    CreatePaymentInput,
) {
  return apiFetch<CreatePaymentResult>(
    "/api/payments",
    {
      method: "POST",

      body:
        JSON.stringify(
          input,
        ),
    },
  );
}

export function getPaymentByQuotationId(
  quotationId: string,

  signal?: AbortSignal,
) {
  return apiFetch<Payment>(
    `/api/payments/${encodeURIComponent(
      quotationId,
    )}`,
    {
      method: "GET",
      signal,
    },
  );
}