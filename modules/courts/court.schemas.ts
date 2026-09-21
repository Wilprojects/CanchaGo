import Joi, {type ObjectSchema,} from "joi";
import {CourtType,} from "@/generated/prisma/enums";
import type {CourtAvailabilityQuery, CreateCourtInput, ListCourtsQuery, UpdateCourtInput,} from "@/modules/courts/court.types";

const nameSchema = Joi.string().trim().min(3).max(120);

const typeSchema = Joi.string().valid(
      ...Object.values(
        CourtType,
      ),
    );

const capacitySchema = Joi.number().integer().min(1).max(50);
const priceSchema = Joi.number().positive().precision(2).max(10000);
const descriptionSchema = Joi.string().trim().min(10).max(1000);
const imageUrlSchema = Joi.string().trim().uri().max(1000).allow(null);

export const createCourtSchema: ObjectSchema<CreateCourtInput> =
  Joi.object({
    name: nameSchema.required(),
    type: typeSchema.required(),
    capacity: capacitySchema.required(),
    pricePerHour: priceSchema.required(),
    description: descriptionSchema.required(),
    imageUrl: imageUrlSchema.default(null),
    active: Joi.boolean().default(true),
  });

export const updateCourtSchema: ObjectSchema<UpdateCourtInput> =
  Joi.object({
    name: nameSchema.optional(),
    type: typeSchema.optional(),
    capacity: capacitySchema.optional(),
    pricePerHour: priceSchema.optional(),
    description: descriptionSchema.optional(),
    imageUrl: imageUrlSchema.optional(),
    active: Joi.boolean().optional(),
  }).min(1);

export const listCourtsQuerySchema: ObjectSchema<ListCourtsQuery> =
  Joi.object({
    type: typeSchema.optional(),
    active: Joi.boolean().default(true),
    search: Joi.string().trim().min(2).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  });

export const courtAvailabilityQuerySchema: ObjectSchema<CourtAvailabilityQuery> =
  Joi.object({
    startAt: Joi.date().iso().required(),
    endAt: Joi.date().iso().required(),
    type: typeSchema.optional(),
  });