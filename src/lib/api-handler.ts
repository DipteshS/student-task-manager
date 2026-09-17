import { NextResponse } from "next/server";

type RouteHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

/**
 * Wraps an API route handler so an unexpected thrown error (a failed DB
 * connection, a bug, etc.) becomes a clean JSON 500 response instead of
 * Next.js's default HTML error page — which breaks `res.json()` on the
 * client and surfaces as an opaque "Something went wrong" with no way to
 * diagnose it. The real error is still logged server-side via console.error,
 * which Vercel captures in the function's logs.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: RouteHandler<Args>
): RouteHandler<Args> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] Unhandled error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
