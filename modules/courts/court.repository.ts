import {prisma,} from "@/lib/db/prisma";
import {ReservationStatus,} from "@/generated/prisma/enums";
import type {CourtAvailabilityQuery, CreateCourtData, ListCourtsQuery, UpdateCourtData,} from "@/modules/courts/court.types";

function buildWhere(query: ListCourtsQuery,) {
  return {
    active: query.active,
    ...(query.type? {type: query.type,}: {}),
    ...(query.search? {
          OR: [
            {
              name: {
                contains:query.search,
                mode: "insensitive" as const,
              },
            },

            {
              description: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
}

export const courtRepository = {
  findMany(query: ListCourtsQuery,) {
    const where = buildWhere(query);
    return prisma.court.findMany({
      where,
      orderBy: [
        {type: "asc",},
        {name: "asc",},
      ],

      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  },

  count(query: ListCourtsQuery,) {
    return prisma.court.count({
      where: buildWhere(query),
    });
  },

  findById(id: number,) {
    return prisma.court.findUnique({
      where: {
        id,
      },
    });
  },

  findBySlug(slug: string,) {
    return prisma.court.findUnique({
      where: {
        slug,
      },
    });
  },

  create(data: CreateCourtData,) {
    return prisma.court.create({
      data,
    });
  },

  update(id: number, data: UpdateCourtData,) {
    return prisma.court.update({
      where: {id,},
      data,
    });
  },

  findForAvailability(query: CourtAvailabilityQuery, now: Date,) {
    return prisma.court.findMany({
      where: {
        active: true,
        ...(query.type
          ? {
              type: query.type,
            }
          : {}),
      },

      include: {
        reservations: {
          where: {
            startAt: {
              lt: query.endAt,
            },

            endAt: {
              gt: query.startAt,
            },

            OR: [
              {
                status: {
                  in: [
                    ReservationStatus.CONFIRMED,
                    ReservationStatus.RESCHEDULED,
                  ],
                },
              },

              {
                status: ReservationStatus.PENDING_PAYMENT,

                OR: [
                  {
                    expiresAt:
                      null,
                  },

                  {
                    expiresAt: {
                      gt: now,
                    },
                  },
                ],
              },
            ],
          },

          select: {
            id: true,
          },

          take: 1,
        },
      },

      orderBy: [
        {
          type: "asc",
        },

        {
          name: "asc",
        },
      ],
    });
  },
};