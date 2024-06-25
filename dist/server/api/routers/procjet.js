"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../api/trpc");
const sandboxManager_1 = require("../sandboxManager");
const ProjectPath_1 = require("../../../utilis/ProjectPath");
const events_1 = require("events");
const observable_1 = require("@trpc/server/observable");
const ee = new events_1.EventEmitter();
// Define constants for event names
const EVENTS = {
    CHAT_IN_PROJECT: "chatInProject",
    CREATE_PERMISSION: "createPermission",
    UPDATE_PROJECT: "updateProject",
    REMOVE_PERMISSION: "removePermission",
};
exports.projectRouter = (0, trpc_1.createTRPCRouter)({
    onChat: trpc_1.publicProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onRename = ({ text, projectId, username, }) => {
                if (projectId === input.channelId) {
                    emit.next({ text, username });
                }
            };
            ee.on(EVENTS.CHAT_IN_PROJECT, onRename);
            return () => {
                ee.off(EVENTS.CHAT_IN_PROJECT, onRename);
            };
        });
    }),
    onCreatePermission: trpc_1.publicProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onPermission = ({ permission, projectId, }) => {
                if (projectId === input.channelId) {
                    emit.next({ permission });
                }
            };
            ee.on(EVENTS.CREATE_PERMISSION, onPermission);
            return () => {
                ee.off(EVENTS.CREATE_PERMISSION, onPermission);
            };
        });
    }),
    onUpdateProjectProperties: trpc_1.publicProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onUpdate = ({ newTitle, newDescription, isPrivate, projectId }) => {
                if (projectId === input.channelId) {
                    emit.next({ newTitle, newDescription, isPrivate });
                }
            };
            ee.on(EVENTS.UPDATE_PROJECT, onUpdate);
            return () => {
                ee.off(EVENTS.UPDATE_PROJECT, onUpdate);
            };
        });
    }),
    onRemovePermission: trpc_1.publicProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.number(),
    }))
        .subscription(async (opts) => {
        const input = opts.input;
        return (0, observable_1.observable)((emit) => {
            const onUpdate = ({ userId, projectId }) => {
                if (projectId === input.channelId) {
                    emit.next({ userId });
                }
            };
            ee.on(EVENTS.REMOVE_PERMISSION, onUpdate);
            return () => {
                ee.off(EVENTS.REMOVE_PERMISSION, onUpdate);
            };
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1).max(320),
        description: zod_1.z.string().min(1).max(320).optional(),
        isPrivate: zod_1.z.boolean(),
    }))
        .mutation(async ({ input: { title, isPrivate, description }, ctx }) => {
        const projectData = {
            name: title,
            author: { connect: { id: ctx.session.user.id } },
            description,
            isPrivate,
            files: {
                create: [
                    {
                        name: "main.js",
                        content: "console.log(`Hello World`)",
                    },
                ],
            },
        };
        const result = await ctx.prisma.$transaction([
            ctx.prisma.project.create({ data: projectData }),
        ]);
        const project = result[0];
        return { project };
    }),
    getById: trpc_1.publicProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
    }))
        .query(async ({ input: { projectId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        return project;
    }),
    updateProperties: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
        newTitle: zod_1.z.string().min(1).max(320),
        newDescription: zod_1.z.string().min(1).max(320),
        isPrivate: zod_1.z.boolean()
    }))
        .mutation(async ({ input: { projectId, newDescription, newTitle, isPrivate }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        if ((project === null || project === void 0 ? void 0 : project.authorId) !== user.id)
            return { error: "Project not found" };
        await ctx.prisma.project.update({
            where: { id: projectId },
            data: {
                description: newDescription,
                name: newTitle,
                isPrivate: isPrivate,
            }
        });
        ee.emit(EVENTS.UPDATE_PROJECT, { newTitle, newDescription, projectId, isPrivate });
        return;
    }),
    addPermission: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
        userId: zod_1.z.string(),
    }))
        .mutation(async ({ input: { projectId, userId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        if ((project === null || project === void 0 ? void 0 : project.authorId) !== user.id)
            return { error: "Project not found" };
        const permission = await ctx.prisma.projectPermission.create({
            data: {
                userId: userId,
                projectId: projectId,
            },
            include: {
                user: true,
            },
        });
        ee.emit(EVENTS.CREATE_PERMISSION, { permission, projectId });
        return;
    }),
    removePermission: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
        userId: zod_1.z.string(),
    }))
        .mutation(async ({ input: { projectId, userId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        if ((project === null || project === void 0 ? void 0 : project.authorId) !== user.id)
            return { error: "Project not found" };
        const deletion = await ctx.prisma.projectPermission.deleteMany({ where: {
                userId: userId,
                projectId: projectId
            } });
        if (deletion.count === 0) {
            return { error: "Unable to delete permission" };
        }
        ee.emit(EVENTS.REMOVE_PERMISSION, { userId, projectId });
        return;
    }),
    chat: trpc_1.publicProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.number(),
        text: zod_1.z.string().min(1),
    }))
        .mutation(async ({ input: { projectId, text }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        if ((project === null || project === void 0 ? void 0 : project.isPrivate) &&
            project.projectPermissions.findIndex((permission) => permission.userId === (user === null || user === void 0 ? void 0 : user.id)) === -1) {
            return { error: "Project not found" };
        }
        let username = "";
        if (user) {
            username = user.username ? user.username : user.name;
        }
        else {
            username = "Anonymous";
        }
        ee.emit(EVENTS.CHAT_IN_PROJECT, { text, projectId, username });
    }),
    runCode: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        idOfFileToRun: zod_1.z.number(),
        projectId: zod_1.z.number(),
    }))
        .mutation(async ({ input: { idOfFileToRun, projectId }, ctx }) => {
        var _a;
        const user = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.user;
        const project = await getProject(user === null || user === void 0 ? void 0 : user.id, projectId, ctx);
        if (!project)
            return null;
        const foldersWithPath = (0, ProjectPath_1.getFoldersWithPaths)(project.folders);
        const filesWithPath = (0, ProjectPath_1.getFilesPaths)(project.files, foldersWithPath);
        const file = filesWithPath.find((file) => file.id === idOfFileToRun) ||
            filesWithPath[0];
        if (!file)
            return;
        const fileName = file.name;
        const result = await (0, sandboxManager_1.runInSandbox)(filesWithPath, fileName, foldersWithPath);
        return result;
    }),
});
const getProject = async (userId, projectId, ctx) => {
    console.log("here");
    const project = await ctx.prisma.project.findFirst({
        where: { id: projectId },
        include: {
            folders: true,
            files: true,
            projectPermissions: {
                include: {
                    user: true,
                },
            },
        },
    });
    if (!(project === null || project === void 0 ? void 0 : project.isPrivate))
        return project;
    if (!userId)
        return null;
    const userHasPermission = project.projectPermissions.find((permission) => permission.userId === userId);
    const userIsAuthor = project.authorId === userId;
    if (userIsAuthor || userHasPermission)
        return project;
    return null;
};
