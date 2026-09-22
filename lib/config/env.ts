function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `La variable de entorno ${name} no está configurada.`,
    );
  }

  return value;
}

function positiveIntegerEnv(
  name: string,
  defaultValue: number,
): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `${name} debe contener un número entero positivo.`,
    );
  }

  return value;
}

const jwtAccessSecret = requireEnv(
  "JWT_ACCESS_SECRET",
);

if (jwtAccessSecret.length < 32) {
  throw new Error(
    "JWT_ACCESS_SECRET debe tener al menos 32 caracteres.",
  );
}

type MercadoPagoEnvironment = | "test"| "production";

function mercadoPagoEnvironmentEnv():
  MercadoPagoEnvironment {
  const value = process.env.MERCADO_PAGO_ENVIRONMENT ?? "test";

  if (value !== "test" && value !== "production"
  ) {
    throw new Error("MERCADO_PAGO_ENVIRONMENT debe ser test o production.",);
  }

  return value;
}

function normalizeBaseUrl(value: string,) {
  return value.replace(/\/+$/,"",);
}

export const env = {
  appName: process.env.APP_NAME ?? "CanchaGo",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  jwtAccessSecret,

  accessTokenTtlMinutes: positiveIntegerEnv("ACCESS_TOKEN_TTL_MINUTES", 15,),
  refreshTokenTtlDays: positiveIntegerEnv("REFRESH_TOKEN_TTL_DAYS", 7,),
  reservationHoldMinutes: positiveIntegerEnv("RESERVATION_HOLD_MINUTES",15,),
  publicAppUrl: normalizeBaseUrl(requireEnv("PUBLIC_APP_URL",),),
  mercadoPagoAccessToken: requireEnv("MERCADO_PAGO_ACCESS_TOKEN",),
  mercadoPagoWebhookSecret: requireEnv("MERCADO_PAGO_WEBHOOK_SECRET",),
  mercadoPagoEnvironment: mercadoPagoEnvironmentEnv(),
} as const;