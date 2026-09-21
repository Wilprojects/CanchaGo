import {ApiError,} from "@/lib/http/api-error";
import {slugify,} from "@/lib/text/slugify";
import {toCourtResponse,} from "@/modules/courts/court.mapper";
import {courtRepository,} from "@/modules/courts/court.repository";
import {CANCHAGO_TIME_ZONE, isSameBusinessDay, isWholeBusinessHour, isWithinBusinessHours,} from "@/lib/date/business-time";
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

const ALLOWED_DURATION_HOURS = [1, 2] as const;
const ONE_HOUR_MS = 60 * 60 * 1000;

function validateAvailabilityWindow(query: CourtAvailabilityQuery,) {
  const now = new Date();

  if (query.startAt.getTime() <= now.getTime()) {
    throw new ApiError(400, "La fecha y hora de inicio deben estar en el futuro.", "START_TIME_IN_PAST",);
  }

  if (query.endAt.getTime() <= query.startAt.getTime()) {
    throw new ApiError(400, "La hora de fin debe ser posterior a la hora de inicio.", "INVALID_TIME_RANGE",);
  }

  if (!isSameBusinessDay(query.startAt, query.endAt,)
  ) {
    throw new ApiError(400, "La reserva debe iniciar y finalizar el mismo día.", "RESERVATION_MUST_BE_SAME_DAY",);
  }

  if (!isWholeBusinessHour(query.startAt,) || !isWholeBusinessHour(query.endAt,)) {
    throw new ApiError(400, "Las reservas deben comenzar y terminar en horas exactas.", "INVALID_TIME_SLOT",);
  }

  const durationHours = (query.endAt.getTime() - query.startAt.getTime()) / ONE_HOUR_MS;

  if (!ALLOWED_DURATION_HOURS.includes(durationHours as 1 | 2,)) {
    throw new ApiError(400, "La duración de la reserva debe ser de 1 o 2 horas.", "INVALID_RESERVATION_DURATION",);
  }

  if (!isWithinBusinessHours(query.startAt, query.endAt,)) {
    throw new ApiError(400, "El horario solicitado se encuentra fuera del horario de atención.", "OUTSIDE_BUSINESS_HOURS",);
  }

  return {now, durationHours,};
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
    const {now, durationHours,} = validateAvailabilityWindow(query,);

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