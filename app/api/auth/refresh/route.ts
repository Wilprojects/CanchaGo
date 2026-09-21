import type {NextRequest,} from "next/server";
import {ApiError,} from "@/lib/http/api-error";
import {apiSuccess,} from "@/lib/http/api-response";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {getRefreshTokenFromRequest, setAuthCookies,} from "@/modules/auth/auth.cookies";
import {authService,} from "@/modules/auth/auth.service";

export const runtime = "nodejs";

export const POST =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const refreshToken = getRefreshTokenFromRequest(request,);

      if (!refreshToken) {
        throw new ApiError(401,"No existe un refresh token.","REFRESH_TOKEN_REQUIRED",);
      }

      const session = await authService.refreshSession(
            refreshToken,
          );

      const response = apiSuccess({
          user: session.user,
          accessToken: session.accessToken,
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