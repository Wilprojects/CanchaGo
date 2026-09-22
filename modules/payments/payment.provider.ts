import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from "mercadopago";

import {
  env,
} from "@/lib/config/env";

const client =
  new MercadoPagoConfig({
    accessToken:
      env.mercadoPagoAccessToken,

    options: {
      timeout: 5000,
    },
  });

const preferenceClient =
  new Preference(
    client,
  );

const paymentClient =
  new Payment(
    client,
  );

interface CreatePreferenceInput {
  quotationId: string;

  reservationId: number;

  courtName: string;

  payerEmail: string;

  amount: number;

  expiresAt: Date;
}

export async function createMercadoPagoPreference(
  input:
    CreatePreferenceInput,
) {
  const response =
    await preferenceClient.create({
      body: {
        items: [
          {
            id:
              `reservation-${input.reservationId}`,

            title:
              `Reserva ${input.courtName}`,

            description:
              `Reserva CanchaGo #${input.reservationId}`,

            quantity: 1,

            currency_id:
              "PEN",

            unit_price:
              input.amount,
          },
        ],

        payer: {
          email:
            input.payerEmail,
        },

        external_reference:
          input.quotationId,

        metadata: {
          quotation_id:
            input.quotationId,

          reservation_id:
            input.reservationId,
        },

        back_urls: {
          success:
            `${env.publicAppUrl}/api/payments/return/success`,

          pending:
            `${env.publicAppUrl}/api/payments/return/pending`,

          failure:
            `${env.publicAppUrl}/api/payments/return/failure`,
        },

        auto_return:
          "approved",

        binary_mode:
          true,

        expires:
          true,

        expiration_date_to:
          input.expiresAt
            .toISOString(),
      },

      requestOptions: {
        idempotencyKey:
          input.quotationId,
      },
    });

  const preferenceId =
    response.id;

  const checkoutUrl =
    env
      .mercadoPagoEnvironment ===
    "test"
      ? (
          response
            .sandbox_init_point ??
          response
            .init_point
        )
      : response.init_point;

  if (
    !preferenceId ||
    !checkoutUrl
  ) {
    throw new Error(
      "Mercado Pago no devolvió preferenceId o checkoutUrl.",
    );
  }

  return {
    preferenceId,
    checkoutUrl,
  };
}

export function getMercadoPagoPayment(
  paymentId:
    | string
    | number,
) {
  return paymentClient.get({
    id:
      paymentId,
  });
}

interface ValidateWebhookInput {
  xSignature:
    | string
    | null;

  xRequestId:
    | string
    | null;

  dataId:
    | string
    | null;
}

export function validateMercadoPagoWebhook(
  input:
    ValidateWebhookInput,
) {
  try {
    WebhookSignatureValidator
      .validate({
        xSignature:
          input.xSignature,

        xRequestId:
          input.xRequestId,

        dataId:
          input.dataId,

        secret:
          env
            .mercadoPagoWebhookSecret,

        toleranceSeconds:
          300,
      });

    return true;
  } catch (error) {
    if (
      error instanceof
      InvalidWebhookSignatureError
    ) {
      return false;
    }

    throw error;
  }
}