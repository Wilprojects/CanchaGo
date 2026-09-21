import type { NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {validateBody,} from "@/lib/http/validate-body";
import {validateQuery,} from "@/lib/http/validate-query";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {requireAdmin,} from "@/modules/auth/auth.authorization";
import {createCourtSchema, listCourtsQuerySchema,} from "@/modules/courts/court.schemas";
import {courtService,} from "@/modules/courts/court.service";

export const runtime = "nodejs";

export const GET = withApiRoute(async ( request: NextRequest,) => {
      const query = validateQuery(
          request,
          listCourtsQuerySchema,
        );

      if (query.active === false) {
        await requireAdmin(request,);
      }

      const result = await courtService.list(query,);
      return apiSuccess(result,);
    },
  );

export const POST = withApiRoute( async (request: NextRequest,) => {
      await requireAdmin(request,);

      const input = await validateBody(
          request,
          createCourtSchema,
        );

      const court = await courtService.create(input,);
      return apiSuccess(court, 201,);
    },
  );