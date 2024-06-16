import { Prisma, PrismaClient, ProjectPermission } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Session } from "next-auth";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { runInSandbox } from "../sandboxManager";
import { getFilesPaths, getFoldersWithPaths } from "~/utilis/ProjectPath";
import { EventEmitter } from "events";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();

// Define constants for event names
const EVENTS = {
  CHAT_IN_PROJECT: "chatInProject",
  CREATE_PERMISSION: "createPermission",
  UPDATE_PROJECT: "updateProject",
  REMOVE_PERMISSION: "removePermission",
};

export const projectRouter = createTRPCRouter({
  onChat: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onRename = ({
          text,
          projectId,
          username,
        }: {
          text: string;
          projectId: number;
          username: string;
        }) => {
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
  onCreatePermission: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onPermission = ({
          permission,
          projectId,
        }: {
          permission: ProjectPermission;
          projectId: number;       
        }) => {
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
  onUpdateProjectProperties: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onUpdate = ({
          newTitle,
          newDescription,
          isPrivate,
          projectId
        }: {
          newTitle: string;
          newDescription: string;
          isPrivate: boolean;
          projectId: number
        }) => {
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
  onRemovePermission: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onUpdate = ({
          userId,
          projectId
        }: {
          userId: string,
          projectId: number
        }) => {
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
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(320),
        description: z.string().min(1).max(320).optional(),
        isPrivate: z.boolean(),
      }),
    )
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
  getById: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ input: { projectId }, ctx }) => {
      const user = ctx.session?.user;
      const project = await getProject(user?.id, projectId, ctx);
      return project;
    }),
  updateProperties: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        newTitle: z.string().min(1).max(320),
        newDescription: z.string().min(1).max(320),
        isPrivate: z.boolean()
      }),
    )
    .mutation(async ({ input: { projectId, newDescription, newTitle, isPrivate }, ctx }) => {
      const user = ctx.session?.user;
      
      const project = await getProject(user?.id, projectId, ctx);
      if (project?.authorId !== user.id) return { error: "Project not found" };
      
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
  addPermission: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input: { projectId, userId }, ctx }) => {
      const user = ctx.session?.user;
      
      const project = await getProject(user?.id, projectId, ctx);
      if (project?.authorId !== user.id) return { error: "Project not found" };
      
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
  removePermission: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input: { projectId, userId }, ctx }) => {
      const user = ctx.session?.user;
      
      const project = await getProject(user?.id, projectId, ctx);
      if (project?.authorId !== user.id) return { error: "Project not found" };
 
      const deletion = await ctx.prisma.projectPermission.deleteMany({ where: {
        userId: userId,
        projectId: projectId
      }});
      
      if (deletion.count === 0) {
        return { error: "Unable to delete permission" };
      }
      ee.emit(EVENTS.REMOVE_PERMISSION, { userId, projectId });
      return;
    }),
  chat: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ input: { projectId, text }, ctx }) => {
      const user = ctx.session?.user;
      const project = await getProject(user?.id, projectId, ctx);
      if (
        project?.isPrivate &&
        project.projectPermissions.findIndex(
          (permission) => permission.userId === user?.id,
        ) === -1
      ) {
        return { error: "Project not found" };
      }
      let username = "";

      if (user) {
        username = user.username ? user.username : user.name!;
      } else {
        username = "Anonymous";
      }

      ee.emit(EVENTS.CHAT_IN_PROJECT, { text, projectId, username });
    }),
  runCode: protectedProcedure
    .input(
      z.object({
        idOfFileToRun: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ input: { idOfFileToRun, projectId }, ctx }) => {
      const user = ctx.session?.user;
      const project = await getProject(user?.id, projectId, ctx);

      if (!project) return null;
      const foldersWithPath = getFoldersWithPaths(project.folders);
      const filesWithPath = getFilesPaths(project.files, foldersWithPath);

      const file =
        filesWithPath.find((file) => file.id === idOfFileToRun) ||
        filesWithPath[0];
      if (!file) return;

      const fileName = file.name;

      const result = await runInSandbox(
        filesWithPath,
        fileName,
        foldersWithPath,
      );

      return result;
    }),
});

const getProject = async (
  userId: string | undefined,
  projectId: number,
  ctx: {
    session: Session | null;
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  },
) => {
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

  if (!project?.isPrivate) return project;

  if (!userId) return null;

  const userHasPermission = project.projectPermissions.find(
    (permission) => permission.userId === userId,
  );
  const userIsAuthor = project.authorId === userId;

  if (userIsAuthor || userHasPermission) return project;

  return null;
};

