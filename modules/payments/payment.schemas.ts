import Joi, {
  type ObjectSchema,
} from "joi";

import type {
  CreatePaymentInput,
} from "@/modules/payments/payment.types";

export const createPaymentSchema:
  ObjectSchema<CreatePaymentInput> =
  Joi.object({
    reservationId:
      Joi.number()
        .integer()
        .positive()
        .required(),
  });