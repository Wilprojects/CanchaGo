export const env = {
  appName: process.env.APP_NAME ?? "CanchaGo",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
} as const;