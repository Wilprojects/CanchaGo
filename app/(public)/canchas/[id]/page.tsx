import {
  notFound,
} from "next/navigation";

import {
  Container,
} from "@/components/ui/container";

import {
  CourtDetail,
} from "@/features/courts/components/court-detail";

interface CourtDetailPageProps {
  params:
    Promise<{
      id: string;
    }>;
}

export default async function CourtDetailPage({
  params,
}: CourtDetailPageProps) {
  const {
    id,
  } =
    await params;

  const courtId =
    Number(id);

  if (
    !Number.isInteger(
      courtId,
    ) ||
    courtId <= 0
  ) {
    notFound();
  }

  return (
    <Container>
      <CourtDetail
        courtId={
          courtId
        }
      />
    </Container>
  );
}