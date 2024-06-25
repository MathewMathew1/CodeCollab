"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpc = void 0;
const httpBatchLink_1 = require("@trpc/client/links/httpBatchLink");
const wsLink_1 = require("@trpc/client/links/wsLink");
const next_1 = require("@trpc/next");
const superjson_1 = __importDefault(require("superjson"));
const client_1 = require("@trpc/client");
// [...]
// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
function getEndingLink(ctx) {
    var _a;
    if (typeof window === "undefined") {
        return (0, httpBatchLink_1.httpBatchLink)({
            /**
             * @link https://trpc.io/docs/v11/data-transformers
             */
            url: `http://localhost:${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000}/api/trpc`,
            headers() {
                var _a;
                if (!((_a = ctx === null || ctx === void 0 ? void 0 : ctx.req) === null || _a === void 0 ? void 0 : _a.headers)) {
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
    const client = (0, wsLink_1.createWSClient)({
        url: "ws://localhost:3001",
    });
    console.log({ client });
    return (0, wsLink_1.wsLink)({
        client,
        /**
         * @link https://trpc.io/docs/v11/data-transformers
         */
    });
}
const wsLinkFunction = () => {
    var _a;
    const client = (0, wsLink_1.createWSClient)({
        url: `ws://localhost:${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001}/api/trpc`,
    });
    return (0, wsLink_1.wsLink)({
        client,
    });
};
/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature with `createReactQueryHooks`.
 * @link https://trpc.io/docs/react#3-create-trpc-hooks
 */
exports.trpc = (0, next_1.createTRPCNext)({
    config({ ctx }) {
        return {
            transformer: superjson_1.default,
            links: [
                (0, client_1.loggerLink)({
                    enabled: (opts) => process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                getEndingLink(ctx),
            ],
            headers() {
                var _a;
                return {
                    cookie: (_a = ctx === null || ctx === void 0 ? void 0 : ctx.req) === null || _a === void 0 ? void 0 : _a.headers.cookie,
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
