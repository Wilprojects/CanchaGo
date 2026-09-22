export type CourtType = | "FOOTBALL" | "PADEL" | "TENNIS" | "BASKETBALL";

export interface Court {
  id: number;
  name: string;
  slug: string;
  type: CourtType;
  capacity: number;
  pricePerHour: number;
  description: string;
  imageUrl:| string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourtPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourtListData {
  items: Court[];
  pagination: CourtPagination;
}

export interface ListCourtsParams {
  type?: CourtType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CourtAvailabilityItem
  extends Court {
  available: boolean;
  durationHours: number;
  totalPrice: number;
}

export interface CourtAvailabilityData {
  items:
    CourtAvailabilityItem[];

  search?: {
    startAt: string;
    endAt: string;
    durationHours: number;
    type:| CourtType| null;
    timeZone: string;
  };

  summary?: unknown;
}

export interface CourtAvailabilityParams {
  startAt: string;
  endAt: string;
  type?: CourtType;
}