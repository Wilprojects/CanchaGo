import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {requireApiSession,} from "@/modules/auth/auth.session";

export const runtime = "nodejs";

export const GET =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const session =
        await requireApiSession(
          request,
        );

      return apiSuccess(
        session.user,
      );
    },
  );