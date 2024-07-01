import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { wsLink, createWSClient } from "@trpc/client/links/wsLink";
import { createTRPCNext } from "@trpc/next";
import type { inferProcedureOutput } from "@trpc/server";
import { NextPageContext } from "next";
import type { AppRouter } from "../server/api/root";
import superjson from "superjson";
import { loggerLink,  TRPCLink } from "@trpc/client";
import getConfig from "next/config";

// [...]

const { publicRuntimeConfig } = getConfig();

const { APP_URL, WS_URL } = publicRuntimeConfig;
// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
console.log({b: APP_URL })
console.log(`${WS_URL}`)
function getEndingLink(ctx: NextPageContext | undefined): TRPCLink<AppRouter> {
  const apiUrl = APP_URL+`/api/trpc`
  const wsUrl = WS_URL 


  if (typeof window === "undefined") {
    return httpBatchLink({
      url: apiUrl,
      headers() {
        if (!ctx?.req?.headers) {
          return {};
        }
        // on ssr, forward client's headers to the server
        return {
          ...ctx.req.headers,
          "x-ssr": "1",
        };
      },
    });
  }

  const client = createWSClient({
    url: wsUrl,
  });
  
  return wsLink({
    client,
  });
}

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature with `createReactQueryHooks`.
 * @link https://trpc.io/docs/react#3-create-trpc-hooks
 */
export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(ctx),
      ],
      headers() {
        return {
          cookie: ctx?.req?.headers.cookie,
        };
      },
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      },
    };
  },
  ssr: false,
});

// export const transformer = superjson;
/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter["_def"]["queries"],
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;
