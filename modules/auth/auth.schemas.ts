import Joi, {type ObjectSchema,} from "joi";

import type {LoginInput,RegisterInput,} from "@/modules/auth/auth.types";

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[a-z]/)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .required();

export const registerSchema:
  ObjectSchema<RegisterInput> =
  Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .max(150)
      .required(),

    password: passwordSchema,
  });

export const loginSchema:
  ObjectSchema<LoginInput> =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .max(150)
      .required(),

    password: Joi.string()
      .max(72)
      .required(),
  });