import {prisma,} from "@/lib/db/prisma";
import type {CreateCourtData, ListCourtsQuery, UpdateCourtData,} from "@/modules/courts/court.types";

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
};