import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {validateQuery,} from "@/lib/http/validate-query";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {courtAvailabilityQuerySchema,} from "@/modules/courts/court.schemas";
import {courtService,} from "@/modules/courts/court.service";

export const runtime = "nodejs";

export const GET = withApiRoute(
    async (request: NextRequest,) => {
      const query = validateQuery(
          request,
          courtAvailabilityQuerySchema,
        );

      const result = await courtService.availability(
            query,
          );

      return apiSuccess(
        result,
      );
    },
  );