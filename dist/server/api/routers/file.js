"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const events_1 = require("events");
const observable_1 = require("@trpc/server/observable");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const client_1 = require("sharedb/lib/client");
const ws_1 = require("ws");
const diff_match_patch_1 = __importDefault(require("diff-match-patch"));
// create a global event emitter (could be replaced by redis, etc)
const ee = new events_1.EventEmitter();
exports.fileRouter = (0, trpc_1.createTRPCRouter)({
    onAdd: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
        requestId: zod_1.z.string(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onAdd = (data) => {
                if (data.channelId === input.channelId) {
                    emit.next(data);
                }
            };
            ee.on("add", onAdd);
            return () => {
                ee.off("add", onAdd);
            };
        });
    }),
    onRename: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onRename = ({ filename, projectId, fileId, }) => {
                if (projectId === input.channelId) {
                    emit.next({ filename, fileId });
                }
            };
            ee.on("renameFile", onRename);
            return () => {
                ee.off("renameFile", onRename);
            };
        });
    }),
    onFileCreated: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFileCreated = (file) => {
                if (file.projectId === input.channelId) {
                    emit.next(file);
                }
            };
            ee.on("fileCreated", onFileCreated);
            return () => {
                ee.off("fileCreated", onFileCreated);
            };
        });
    }),
    onFileDeleted: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFileDeleted = ({ fileId, projectId, }) => {
                if (projectId === input.channelId) {
                    emit.next(fileId);
                }
            };
            ee.on("deleteFile", onFileDeleted);
            return () => {
                ee.off("deleteFile", onFileDeleted);
            };
        });
    }),
    onFileUpdate: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
        requestIdSubscription: zod_1.z.string(),
    }))
        .subscription((opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFileUpdate = ({ change, projectId, fileId, requestId, }) => {
                console.log({ requestId });
                console.log({ a: input.requestIdSubscription });
                if (projectId === input.channelId &&
                    requestId !== input.requestIdSubscription) {
                    console.log("nie");
                    emit.next({ change, fileId });
                }
            };
            ee.on("updateFile", onFileUpdate);
            return () => {
                ee.off("updateFile", onFileUpdate);
            };
        });
    }),
    onFileMove: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFileMove = ({ fileId, projectId, newFolderId, }) => {
                if (projectId === input.channelId) {
                    emit.next({ fileId, newFolderId });
                }
            };
            ee.on("moveFile", onFileMove);
            return () => {
                ee.off("moveFile", onFileMove);
            };
        });
    }),
    add: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        text: zod_1.z.string().min(1),
        channelId: zod_1.z.number(), // Assuming channelId is required for adding a post
    }))
        .mutation(async ({ input: { id, text, channelId }, ctx }) => {
        const socket = new ws_1.WebSocket("ws://localhost:3001");
        const connection = new client_1.Connection(socket);
        const doc = connection.get("doc-collection", id);
        doc.subscribe((error) => {
            if (error)
                return console.error(error);
            if (!doc.type) {
                doc.create({ counter: 0 }, (error) => {
                    if (error)
                        console.error(error);
                });
            }
            doc.submitOp([{ p: ["counter"], na: 1 }]);
        });
        ee.emit("add", text);
    }),
    rename: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        fileId: zod_1.z.number(),
        filename: zod_1.z.string(),
    }))
        .mutation(async ({ input: { fileId, filename }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const file = await ctx.prisma.file.findFirst({
            where: { id: fileId },
        });
        const project = await ctx.prisma.project.findFirst({
            where: { id: file === null || file === void 0 ? void 0 : file.projectId },
            include: {
                projectPermissions: true,
                files: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const fileWithThatNameIsInFolderAlready = (project === null || project === void 0 ? void 0 : project.files.findIndex((fileHere) => fileHere.folderId == (file === null || file === void 0 ? void 0 : file.folderId) && fileHere.name === filename)) !== -1;
        if (fileWithThatNameIsInFolderAlready) {
            return;
        }
        await ctx.prisma.file.update({
            where: { id: fileId },
            data: { name: filename },
        });
        ee.emit("renameFile", { filename, projectId: project === null || project === void 0 ? void 0 : project.id, fileId });
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        fileId: zod_1.z.number(),
        change: zod_1.z.any().optional(),
        requestId: zod_1.z.string(),
    }))
        .mutation(async ({ input: { fileId, change, requestId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const file = await ctx.prisma.file.findFirst({
            where: { id: fileId },
        });
        if (!file)
            return { error: "File doesn't exist" };
        const project = await ctx.prisma.project.findFirst({
            where: { id: file === null || file === void 0 ? void 0 : file.projectId },
            include: {
                projectPermissions: true,
            },
        });
        if (!project)
            return { error: "Project doesn't exist" };
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return { error: "You are not authorized" };
        }
        const dmp = new diff_match_patch_1.default();
        const patch = dmp.patch_make(file.content, change);
        const [newText] = dmp.patch_apply(patch, file.content);
        await ctx.prisma.file.update({
            where: { id: fileId },
            data: { content: newText },
        });
        ee.emit("updateFile", {
            change,
            projectId: project === null || project === void 0 ? void 0 : project.id,
            fileId,
            requestId,
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        folderId: zod_1.z.number().optional(),
        projectId: zod_1.z.number(),
        name: zod_1.z.string(), // Assuming channelId is required for adding a post
    }))
        .mutation(async ({ input: { folderId, projectId, name }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await ctx.prisma.project.findFirst({
            where: { id: projectId },
            include: {
                projectPermissions: true,
                files: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const fileWithThatNameIsInFolderAlready = (project === null || project === void 0 ? void 0 : project.files.findIndex((file) => {
            console.log(file.name === name);
            return file.folderId == folderId && file.name === name;
        })) !== -1;
        if (fileWithThatNameIsInFolderAlready) {
            return;
        }
        const file = await ctx.prisma.file.create({
            data: { name, folderId, projectId, content: "" },
        });
        ee.emit("fileCreated", file);
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        fileId: zod_1.z.number(),
    }))
        .mutation(async ({ input: { fileId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const file = await ctx.prisma.file.findFirst({
            where: { id: fileId },
        });
        const project = await ctx.prisma.project.findFirst({
            where: { id: file === null || file === void 0 ? void 0 : file.projectId },
            include: {
                projectPermissions: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        await ctx.prisma.file.delete({
            where: { id: fileId },
        });
        ee.emit("deleteFile", { fileId, projectId: file === null || file === void 0 ? void 0 : file.projectId });
    }),
    move: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        fileId: zod_1.z.number(),
        projectId: zod_1.z.number(),
        newFolderId: zod_1.z.number().optional(),
    }))
        .mutation(async ({ input: { fileId, projectId, newFolderId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await ctx.prisma.project.findFirst({
            where: { id: projectId },
            include: {
                projectPermissions: true,
                files: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const file = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id === fileId);
        const fileWithThatNameIsInFolderAlready = (project === null || project === void 0 ? void 0 : project.files.findIndex((fileHere) => {
            return (fileHere.folderId == newFolderId && (file === null || file === void 0 ? void 0 : file.name) === fileHere.name);
        })) !== -1;
        if (fileWithThatNameIsInFolderAlready) {
            return;
        }
        const newId = newFolderId ? newFolderId : null;
        await ctx.prisma.file.update({
            where: { id: fileId },
            data: { folderId: newId },
        });
        ee.emit("moveFile", { fileId, projectId, newFolderId });
    }),
});
