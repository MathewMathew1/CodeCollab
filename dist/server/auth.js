"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerAuthSession = exports.authOptions = void 0;
const prisma_adapter_1 = require("@next-auth/prisma-adapter");
const next_auth_1 = require("next-auth");
const discord_1 = __importDefault(require("next-auth/providers/discord"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const env_1 = require("../env");
const db_1 = require("../server/db");
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
exports.authOptions = {
    callbacks: {
        session: async ({ session, user }) => {
            const userDb = await db_1.db.user.findFirst({
                where: { id: user.id }
            });
            return {
                ...session,
                user: {
                    ...session.user,
                    username: userDb === null || userDb === void 0 ? void 0 : userDb.username,
                    id: user.id,
                },
            };
        },
    },
    adapter: (0, prisma_adapter_1.PrismaAdapter)(db_1.db),
    providers: [
        (0, discord_1.default)({
            clientId: env_1.env.DISCORD_CLIENT_ID,
            clientSecret: env_1.env.DISCORD_CLIENT_SECRET,
        }),
        (0, google_1.default)({
            clientId: env_1.env.GOOGLE_CLIENT_ID,
            clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
};
/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
const getServerAuthSession = (ctx) => {
    return (0, next_auth_1.getServerSession)(ctx.req, ctx.res, exports.authOptions);
};
exports.getServerAuthSession = getServerAuthSession;
