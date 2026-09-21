import type {CourtType,} from "@/generated/prisma/enums";

export interface CreateCourtInput {
  name: string;
  type: CourtType;
  capacity: number;
  pricePerHour: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
}

export interface UpdateCourtInput {
  name?: string;
  type?: CourtType;
  capacity?: number;
  pricePerHour?: number;
  description?: string;
  imageUrl?: string | null;
  active?: boolean;
}

export interface ListCourtsQuery {
  type?: CourtType;
  active: boolean;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateCourtData extends CreateCourtInput {
  slug: string;
}

export interface UpdateCourtData extends UpdateCourtInput {
  slug?: string;
}

export interface CourtEntityShape {
  id: number;
  name: string;
  slug: string;
  type: CourtType;
  capacity: number;
  pricePerHour: {toString(): string;};
  description: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourtResponse {
  id: number;
  name: string;
  slug: string;
  type: CourtType;
  capacity: number;
  pricePerHour: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}