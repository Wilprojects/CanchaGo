import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {validateBody,} from "@/lib/http/validate-body";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {registerSchema,} from "@/modules/auth/auth.schemas";
import {authService,} from "@/modules/auth/auth.service";

export const runtime = "nodejs";

export const POST = withApiRoute(
    async (request: NextRequest,) => {
      const input = await validateBody(request, registerSchema,);
      const user = await authService.register(input,);
      return apiSuccess(user, 201,);
    },
  );