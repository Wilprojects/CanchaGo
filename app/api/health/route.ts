import { NextResponse } from "next/server";

import { env } from "@/lib/config/env";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      application: env.appName,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
    },
  );
}