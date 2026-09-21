import {ApiError,} from "@/lib/http/api-error";
import {slugify,} from "@/lib/text/slugify";
import {toCourtResponse,} from "@/modules/courts/court.mapper";
import {courtRepository,} from "@/modules/courts/court.repository";
import {CANCHAGO_TIME_ZONE,} from "@/lib/date/business-time";
import {validateReservationWindow,} from "@/modules/reservations/reservation-window";
import type {CourtAvailabilityQuery, CreateCourtInput, ListCourtsQuery, UpdateCourtData, UpdateCourtInput,} from "@/modules/courts/court.types";

function createCourtSlug( name: string,) {
  const slug = slugify(name);

  if (!slug) {
    throw new ApiError(400, "El nombre de la cancha no permite generar un slug válido.", "INVALID_COURT_NAME",);
  }

  return slug;
}

async function findCourtOrThrow(id: number,) {
  const court = await courtRepository.findById(id);

  if (!court) {
    throw new ApiError(404, "La cancha no existe.", "COURT_NOT_FOUND",);
  }

  return court;
}


export const courtService = {
  async list(query: ListCourtsQuery,) {
    const [courts, total,] = await Promise.all([
        courtRepository.findMany(query),
        courtRepository.count(query),
      ]);

    return {
      items: courts.map(toCourtResponse,),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit,),
      },
    };
  },

  async getById(id: number,) {
    const court = await findCourtOrThrow(id,);
    return toCourtResponse(court,);
  },

  async create(input: CreateCourtInput,) {
    const slug = createCourtSlug(input.name,);
    const existing = await courtRepository.findBySlug(slug);

    if (existing) {
        throw new ApiError(409, "Ya existe una cancha con un nombre equivalente.", "COURT_ALREADY_EXISTS",);
    }

    const court = await courtRepository.create({
        ...input,
        slug,
      });

    return toCourtResponse(
      court,
    );
  },

  async update(id: number, input: UpdateCourtInput,) {
    const currentCourt = await findCourtOrThrow(id,);
    const data: UpdateCourtData = {...input,};

    if (input.name !== undefined && input.name !== currentCourt.name) {
      const slug =
        createCourtSlug(
          input.name,
        );

      const slugOwner =  await courtRepository.findBySlug(slug);

      if (slugOwner && slugOwner.id !== id) {
        throw new ApiError(409, "Ya existe una cancha con un nombre equivalente.", "COURT_ALREADY_EXISTS",);
      }

      data.slug = slug;
    }

    const updatedCourt = await courtRepository.update(id, data,);

    return toCourtResponse(updatedCourt,);
  },

  async disable(id: number,) {
    const court = await findCourtOrThrow(id,);

    if (!court.active) {
      return toCourtResponse(court,);
    }

    const updatedCourt = await courtRepository.update(
        id,
        {
          active: false,
        },
      );

    return toCourtResponse(
      updatedCourt,
    );
  },

  async availability(query:CourtAvailabilityQuery,) {
    const now = new Date();

    const {durationHours,} = validateReservationWindow(
        query,
        now,
      );

    const courts = await courtRepository.findForAvailability(
          query,
          now,
        );

    const items = courts.map(
        (court) => {

          const {reservations, ...courtEntity} = court;

          const response = toCourtResponse(courtEntity,);

          const available = reservations.length === 0;

          const totalPrice = Number(
              (
                response.pricePerHour *
                durationHours
              ).toFixed(2),
            );

          return {
            ...response,
            available,
            durationHours,
            totalPrice,
          };
        },
      );

    const availableCount = items.filter((court) => court.available,).length;

    return {
      search: {
        startAt:query.startAt.toISOString(),
        endAt: query.endAt.toISOString(),
        durationHours,
        type: query.type ?? null,
        timeZone: CANCHAGO_TIME_ZONE,
      },
      items,
      summary: {
        total:items.length,
        available: availableCount,
        unavailable: items.length - availableCount,
      },
    };
  },

};