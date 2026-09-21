import type {NextRequest,} from "next/server";
import {apiSuccess,} from "@/lib/http/api-response";
import {withApiRoute,} from "@/lib/http/with-api-route";
import {clearAuthCookies,getRefreshTokenFromRequest,} from "@/modules/auth/auth.cookies";
import {authService,} from "@/modules/auth/auth.service";

export const runtime = "nodejs";

export const POST =
  withApiRoute(
    async (request: NextRequest,) => {
      const refreshToken = getRefreshTokenFromRequest(request,);
      await authService.logout(refreshToken,);
      const response = apiSuccess({message:"Sesión cerrada correctamente.",});
      clearAuthCookies(response,);
      return response;
    },
  );