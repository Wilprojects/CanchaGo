import { NextResponse } from "next/server";

import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        application: env.appName,
        environment: process.env.NODE_ENV,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Health check database error:", error);

    return NextResponse.json(
      {
        status: "error",
        application: env.appName,
        environment: process.env.NODE_ENV,
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
      },
    );
  }
}