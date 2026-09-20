import { NextResponse } from "next/server";

export function apiSuccess<T>(
  data: T,
  status = 200,
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
    },
  );
}