"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const env_nextjs_1 = require("@t3-oss/env-nextjs");
const zod_1 = require("zod");
console.log({ a: process.env.DATABASE_URL });
console.log({ b: process.env.NEXTAUTH_SECRET });
console.log({ c: process.env.NEXTAUTH_URL });
console.log({ d: process.env.DISCORD_CLIENT_SECRET });
console.log({ h: process.env.DISCORD_CLIENT_ID });
console.log({ e: process.env.GOOGLE_CLIENT_ID });
console.log({ f: process.env.GOOGLE_CLIENT_SECRET });
exports.env = (0, env_nextjs_1.createEnv)({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DATABASE_URL: zod_1.z
            .string()
            .url()
            .refine((str) => !str.includes("YOUR_MYSQL_URL_HERE"), "You forgot to change the default URL"),
        NODE_ENV: zod_1.z
            .enum(["development", "test", "production"])
            .default("development"),
        NEXTAUTH_SECRET: process.env.NODE_ENV === "production"
            ? zod_1.z.string().min(1)
            : zod_1.z.string().min(1).optional(),
        NEXTAUTH_URL: zod_1.z.preprocess(
        // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
        // Since NextAuth.js automatically uses the VERCEL_URL if present.
        (str) => { var _a; return (_a = process.env.VERCEL_URL) !== null && _a !== void 0 ? _a : str; }, 
        // VERCEL_URL doesn't include `https` so it cant be validated as a URL
        process.env.VERCEL ? zod_1.z.string().min(1) : zod_1.z.string().url()),
        // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
        DISCORD_CLIENT_ID: zod_1.z.string(),
        DISCORD_CLIENT_SECRET: zod_1.z.string(),
        GOOGLE_CLIENT_ID: zod_1.z.string(),
        GOOGLE_CLIENT_SECRET: zod_1.z.string()
    },
    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    },
    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
