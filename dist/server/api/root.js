"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
/**
 * This file contains the root router of your tRPC-backend
 */
const trpc_1 = require("./trpc");
const file_1 = require("./routers/file");
const procjet_1 = require("./routers/procjet");
const folder_1 = require("./routers/folder");
const user_1 = require("./routers/user");
exports.appRouter = (0, trpc_1.router)({
    healthcheck: trpc_1.publicProcedure.query(() => console.log({ check: "yay!" })),
    file: file_1.fileRouter,
    user: user_1.userRouter,
    folder: folder_1.folderRouter,
    project: procjet_1.projectRouter,
});
