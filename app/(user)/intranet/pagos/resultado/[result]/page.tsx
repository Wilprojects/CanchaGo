import {
  notFound,
} from "next/navigation";

import {
  PaymentResult,
} from "@/features/payments/components/payment-result";

interface PaymentResultPageProps {
  params:
    Promise<{
      result: string;
    }>;

  searchParams:
    Promise<{
      quotationId?: string;

      external_reference?:
        string;

      payment_id?:
        string;

      status?:
        string;
    }>;
}

export default async function PaymentResultPage({
  params,
  searchParams,
}: PaymentResultPageProps) {
  const {
    result,
  } =
    await params;

  const query =
    await searchParams;

  if (
    result !== "success" &&
    result !== "pending" &&
    result !== "failure"
  ) {
    notFound();
  }

  const quotationId =
    query.quotationId ??
    query.external_reference ??
    null;

  return (
    <PaymentResult
      result={
        result
      }
      quotationId={
        quotationId
      }
    />
  );
}