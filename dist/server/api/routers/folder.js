"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderRouter = void 0;
const events_1 = require("events");
const server_1 = require("@trpc/server");
const observable_1 = require("@trpc/server/observable");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
// create a global event emitter (could be replaced by redis, etc)
const ee = new events_1.EventEmitter();
const t = server_1.initTRPC.create();
exports.folderRouter = t.router({
    onFolderCreated: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFolderCreated = (folder) => {
                if (folder.projectId === input.channelId) {
                    emit.next(folder);
                }
            };
            ee.on("folderCreated", onFolderCreated);
            return () => {
                ee.off("folderCreated", onFolderCreated);
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
            const onRename = ({ foldername, projectId, folderId, }) => {
                if (projectId === input.channelId) {
                    emit.next({ foldername, folderId });
                }
            };
            ee.on("renameFolder", onRename);
            return () => {
                ee.off("renameFolder", onRename);
            };
        });
    }),
    onFolderDeleted: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFolderDeleted = ({ folderId, projectId, }) => {
                if (projectId === input.channelId) {
                    emit.next(folderId);
                }
            };
            ee.on("deleteFolder", onFolderDeleted);
            return () => {
                ee.off("deleteFolder", onFolderDeleted);
            };
        });
    }),
    onFolderMove: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onFolderMove = ({ folderId, projectId, newFolderId, }) => {
                if (projectId === input.channelId) {
                    emit.next({ folderId, newFolderId });
                }
            };
            ee.on("moveFolder", onFolderMove);
            return () => {
                ee.off("moveFolder", onFolderMove);
            };
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        folderId: zod_1.z.number().optional(),
        projectId: zod_1.z.number(),
        name: zod_1.z.string(),
    }))
        .mutation(async ({ input: { folderId, projectId, name }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await ctx.prisma.project.findFirst({
            where: { id: projectId },
            include: {
                projectPermissions: true,
                folders: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const folderWithThatNameAlreadyExistInSameDictionary = (project === null || project === void 0 ? void 0 : project.folders.findIndex((folder) => {
            return folder.parentId == folderId && folder.name === name;
        })) !== -1;
        if (folderWithThatNameAlreadyExistInSameDictionary) {
            return;
        }
        const folder = await ctx.prisma.folder.create({
            data: { name, parentId: folderId, projectId },
        });
        ee.emit("folderCreated", folder);
    }),
    rename: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        folderId: zod_1.z.number(),
        foldername: zod_1.z.string(),
    }))
        .mutation(async ({ input: { folderId, foldername }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const folder = await ctx.prisma.folder.findFirst({
            where: { id: folderId },
        });
        const project = await ctx.prisma.project.findFirst({
            where: { id: folder === null || folder === void 0 ? void 0 : folder.projectId },
            include: {
                projectPermissions: true,
                folders: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const folderWithThatNameAlreadyExistInSameDictionary = (project === null || project === void 0 ? void 0 : project.folders.findIndex((folder) => folder.parentId == folderId && folder.name === foldername)) !== -1;
        if (folderWithThatNameAlreadyExistInSameDictionary) {
            return;
        }
        await ctx.prisma.folder.update({
            where: { id: folderId },
            data: { name: foldername },
        });
        ee.emit("renameFolder", { foldername, projectId: project === null || project === void 0 ? void 0 : project.id, folderId });
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        folderId: zod_1.z.number(),
    }))
        .mutation(async ({ input: { folderId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const folder = await ctx.prisma.folder.findFirst({
            where: { id: folderId },
        });
        const project = await ctx.prisma.project.findFirst({
            where: { id: folder === null || folder === void 0 ? void 0 : folder.projectId },
            include: {
                projectPermissions: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        await ctx.prisma.folder.delete({
            where: { id: folderId },
        });
        ee.emit("deleteFolder", { folderId, projectId: folder === null || folder === void 0 ? void 0 : folder.projectId });
    }),
    move: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        folderId: zod_1.z.number(),
        projectId: zod_1.z.number(),
        newFolderId: zod_1.z.number().optional(),
    }))
        .mutation(async ({ input: { folderId, projectId, newFolderId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        if (folderId === newFolderId)
            return;
        const project = await ctx.prisma.project.findFirst({
            where: { id: projectId },
            include: {
                projectPermissions: true,
                folders: true,
            },
        });
        const userHasPermission = project.projectPermissions.find((permission) => permission.userId === user.id);
        const userIsAuthor = project.authorId === user.id;
        if (!userIsAuthor && !userHasPermission) {
            return;
        }
        const folder = project === null || project === void 0 ? void 0 : project.folders.find((folder) => folder.id === folderId);
        const folderWithThatNameAlreadyExistInSameDictionary = (project === null || project === void 0 ? void 0 : project.folders.findIndex((folderHere) => {
            folderHere.parentId == newFolderId &&
                folderHere.name === (folder === null || folder === void 0 ? void 0 : folder.name);
        })) !== -1;
        if (folderWithThatNameAlreadyExistInSameDictionary) {
            return;
        }
        const groupFolder = {};
        project === null || project === void 0 ? void 0 : project.folders.forEach((folder) => {
            var _a;
            if (folder.parentId == null) {
                return;
            }
            //ignoring warning since group is always created before adding
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            groupFolder[_a = folder.parentId] || (groupFolder[_a] = []);
            groupFolder[folder.parentId].push(folder);
        });
        if (folderId && isSubFolderRecursive(folderId, newFolderId, groupFolder))
            return;
        const newId = newFolderId ? newFolderId : null;
        await ctx.prisma.folder.update({
            where: { id: folderId },
            data: { parentId: newId },
        });
        ee.emit("moveFolder", { folderId, projectId, newFolderId });
    }),
});
const isSubFolderRecursive = (folderId, newFolderId, groupFolder) => {
    const folders = groupFolder[folderId] || [];
    for (const subFolder of folders) {
        if (subFolder.id === newFolderId) {
            return true; // Found `newFolderId` in subfolders
        }
        // Recursively check in subfolders
        if (isSubFolderRecursive(subFolder.id, newFolderId, groupFolder)) {
            return true; // Found `newFolderId` in subfolders of subfolder
        }
    }
    return false; // `newFolderId` not found in subfolders
};
