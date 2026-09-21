import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {parseRouteId,} from "@/lib/http/parse-route-id";
import {validateBody,} from "@/lib/http/validate-body";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {requireAdmin,} from "@/modules/auth/auth.authorization";
import {updateCourtSchema,} from "@/modules/courts/court.schemas";
import {courtService,} from "@/modules/courts/court.service";

export const runtime = "nodejs";

interface CourtRouteContext {
  params: Promise<{id: string;}>;
}

export const GET = withApiRoute(
    async (_request: NextRequest, context: CourtRouteContext,) => {
      const {id: rawId,} = await context.params;
      const id = parseRouteId(rawId,);
      const court = await courtService.getById(id);
      return apiSuccess(court,);
    },
  );

export const PATCH = withApiRoute(
    async (request: NextRequest, context: CourtRouteContext,) => {
      await requireAdmin(request,);

      const {id: rawId,} = await context.params;
      const id = parseRouteId(rawId,);

      const input = await validateBody(
          request,
          updateCourtSchema,
        );

      const court = await courtService.update(
            id,
            input,
          );

      return apiSuccess(
        court,
      );
    },
  );

export const DELETE = withApiRoute(
    async (request: NextRequest, context: CourtRouteContext,) => {
      await requireAdmin(request,);

      const {id: rawId,} = await context.params;

      const id = parseRouteId(rawId,);

      const court = await courtService.disable(id);

      return apiSuccess({
        message: "Cancha desactivada correctamente.",
        court,
      });
    },
  );