import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {validateBody,} from "@/lib/http/validate-body";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {setAuthCookies,} from "@/modules/auth/auth.cookies";
import {loginSchema,} from "@/modules/auth/auth.schemas";
import {authService,} from "@/modules/auth/auth.service";

export const runtime = "nodejs";

export const POST =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const input = await validateBody(
          request,
          loginSchema,
        );

      const session = await authService.login(
          input,
        );

      const response =
        apiSuccess({
          user: session.user,
          accessToken:session.accessToken,
          tokenType: "Bearer",
          expiresIn: session.expiresIn,
        });

      setAuthCookies(
        response,
        session,
      );

      return response;
    },
  );