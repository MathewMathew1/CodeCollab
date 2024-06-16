import { httpBatchLink } from "@trpc/client/links/httpBatchLink";

import { wsLink, createWSClient } from "@trpc/client/links/wsLink";
import { createTRPCNext } from "@trpc/next";
import type { inferProcedureOutput } from "@trpc/server";
import { NextPageContext } from "next";
import getConfig from "next/config";
import type { AppRouter } from "../server/api/root";
import superjson from "superjson";
import { uneval } from "devalue";
import { loggerLink, Operation, splitLink, TRPCLink } from "@trpc/client";

// [...]

// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export

function getEndingLink(ctx: NextPageContext | undefined): TRPCLink<AppRouter> {
  if (typeof window === "undefined") {
    return httpBatchLink({
      /**
       * @link https://trpc.io/docs/v11/data-transformers
       */

      url: `http://localhost:${process.env.PORT ?? 3000}/api/trpc`,
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
    url: "ws://localhost:3001",
  });
  console.log({ client });
  return wsLink({
    client,
    /**
     * @link https://trpc.io/docs/v11/data-transformers
     */
  });
}

const wsLinkFunction = () => {
  const client = createWSClient({
    url: `ws://localhost:${process.env.PORT ?? 3001}/api/trpc`,
  });
  return wsLink<AppRouter>({
    client,
  });
};

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
