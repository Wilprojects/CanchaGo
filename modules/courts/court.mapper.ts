import type {CourtEntityShape, CourtResponse,} from "@/modules/courts/court.types";

export function toCourtResponse(
  court: CourtEntityShape,
): CourtResponse {
  return {
    id: court.id,
    name: court.name,
    slug: court.slug,
    type: court.type,
    capacity: court.capacity,
    pricePerHour: Number(court.pricePerHour.toString(),),
    description: court.description,
    imageUrl: court.imageUrl,
    active: court.active,
    createdAt: court.createdAt.toISOString(),
    updatedAt: court.updatedAt.toISOString(),
  };
}