/**
 * This file contains the root router of your tRPC-backend
 */
import { router, publicProcedure } from "./trpc";
import { fileRouter } from "./routers/file";
import { projectRouter } from "./routers/procjet";
import { folderRouter } from "./routers/folder";
import { userRouter } from "./routers/user";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => console.log({check: "yay!"})),
  file: fileRouter,
  user: userRouter,
  folder: folderRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
