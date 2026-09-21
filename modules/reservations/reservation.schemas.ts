import Joi, {type ObjectSchema,} from "joi";
import {ReservationStatus,} from "@/generated/prisma/enums";
import type {CreateReservationInput,ListReservationsQuery,UpdateReservationInput,} from "@/modules/reservations/reservation.types";

export const createReservationSchema:
  ObjectSchema<CreateReservationInput> =
  Joi.object({
    courtId:
      Joi.number()
        .integer()
        .positive()
        .required(),

    startAt:
      Joi.date()
        .iso()
        .required(),

    endAt:
      Joi.date()
        .iso()
        .required(),
  });

export const listReservationsQuerySchema:
  ObjectSchema<ListReservationsQuery> =
  Joi.object({
    status:
      Joi.string()
        .valid(
          ...Object.values(
            ReservationStatus,
          ),
        )
        .optional(),

    page:
      Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit:
      Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
  });

export const updateReservationSchema:
  ObjectSchema<UpdateReservationInput> =
  Joi.object({
    action:
      Joi.string()
        .valid(
          "CANCEL",
          "RESCHEDULE",
        )
        .required(),

    startAt:
      Joi.when(
        "action",
        {
          is:
            "RESCHEDULE",

          then:
            Joi.date()
              .iso()
              .required(),

          otherwise:
            Joi.forbidden(),
        },
      ),

    endAt:
      Joi.when(
        "action",
        {
          is:
            "RESCHEDULE",

          then:
            Joi.date()
              .iso()
              .required(),

          otherwise:
            Joi.forbidden(),
        },
      ),
  });