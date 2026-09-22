import {
  notFound,
} from "next/navigation";

import {
  ReservationDetail,
} from "@/features/reservations/components/reservation-detail";

interface ReservationDetailPageProps {
  params:
    Promise<{
      id: string;
    }>;
}

export default async function ReservationDetailPage({
  params,
}: ReservationDetailPageProps) {
  const {
    id,
  } =
    await params;

  const reservationId =
    Number(id);

  if (
    !Number.isInteger(
      reservationId,
    ) ||
    reservationId <= 0
  ) {
    notFound();
  }

  return (
    <ReservationDetail
      reservationId={
        reservationId
      }
    />
  );
}