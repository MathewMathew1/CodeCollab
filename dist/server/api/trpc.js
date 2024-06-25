"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.mergeRouters = exports.createTRPCRouter = exports.middleware = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const superjson_1 = __importDefault(require("superjson"));
const zod_1 = require("zod");
const t = server_1.initTRPC.context().create({
    transformer: superjson_1.default,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof zod_1.ZodError ? error.cause.flatten() : null,
            },
        };
    },
});
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.middleware = t.middleware;
exports.createTRPCRouter = t.router;
exports.mergeRouters = t.mergeRouters;
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
        throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});
exports.protectedProcedure = t.procedure.use(enforceUserIsAuthed);
