import type {
  CourtType,
} from "@/features/courts/court.types";

export const COURT_TYPE_LABELS: Record<CourtType, string> = {
  FOOTBALL: "Fútbol",
  PADEL: "Pádel",
  TENNIS: "Tenis",
  BASKETBALL: "Básquet",
};

export const COURT_TYPE_SHORT_LABELS:Record<CourtType, string> = {
  FOOTBALL: "F7",
  PADEL: "PA",
  TENNIS: "TE",
  BASKETBALL: "BA",
};

export function formatCourtPrice(
  price: number,
) {
  return new Intl.NumberFormat(
      "es-PE",
      {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
      },
    )
    .format(price);
}