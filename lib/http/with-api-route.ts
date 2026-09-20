import { handleRouteError } from "@/lib/http/handle-route-error";

type AsyncRouteHandler<TArgs extends unknown[]> = (
  ...args: TArgs
) => Promise<Response>;

export function withApiRoute<TArgs extends unknown[]>(
  handler: AsyncRouteHandler<TArgs>,
): AsyncRouteHandler<TArgs> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleRouteError(error);
    }
  };
}