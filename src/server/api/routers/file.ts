import { EventEmitter } from "events";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Connection } from "sharedb/lib/client";
import { WebSocket } from "ws";
import diffMatchPatch from "diff-match-patch";
// create a global event emitter (could be replaced by redis, etc)

const ee = new EventEmitter();

export const fileRouter = createTRPCRouter({
  onAdd: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        requestId: z.string(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onAdd = (data: any) => {
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

  onRename: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onRename = ({
          filename,
          projectId,
          fileId,
        }: {
          filename: string;
          projectId: number;
          fileId: number;
        }) => {
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
  onFileCreated: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFileCreated = (file: {
          id: number;
          name: string;
          content: string;
          projectId: number;
          folderId: number | null;
        }) => {
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
  onFileDeleted: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFileDeleted = ({
          fileId,
          projectId,
        }: {
          fileId: number;
          projectId: number;
        }) => {
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
  onFileUpdate: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        requestIdSubscription: z.string(),
      }),
    )
    .subscription((opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFileUpdate = ({
          change,
          projectId,
          fileId,
          requestId,
        }: {
          change: string;
          projectId: number;
          fileId: number;
          requestId: string;
        }) => {
          console.log({ requestId });
          console.log({ a: input.requestIdSubscription });
          if (
            projectId === input.channelId &&
            requestId !== input.requestIdSubscription
          ) {
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
  onFileMove: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFileMove = ({
          fileId,
          projectId,
          newFolderId,
        }: {
          fileId: number;
          projectId: number;
          newFolderId: number;
        }) => {
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
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(1),
        channelId: z.number(), // Assuming channelId is required for adding a post
      }),
    )
    .mutation(async ({ input: { id, text, channelId }, ctx }) => {
      const socket = new WebSocket("ws://localhost:3001");
      const connection = new Connection(socket as any);

      const doc = connection.get("doc-collection", id);

      doc.subscribe((error: any) => {
        if (error) return console.error(error);

        if (!doc.type) {
          doc.create({ counter: 0 }, (error: any) => {
            if (error) console.error(error);
          });
        }

        doc.submitOp([{ p: ["counter"], na: 1 }]);
      });

      ee.emit("add", text);
    }),
  rename: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ input: { fileId, filename }, ctx }) => {
      const user = ctx.session?.user!;

      const file = await ctx.prisma.file.findFirst({
        where: { id: fileId },
      });

      const project = await ctx.prisma.project.findFirst({
        where: { id: file?.projectId },
        include: {
          projectPermissions: true,
          files: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;

      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      const fileWithThatNameIsInFolderAlready =
        project?.files.findIndex(
          (fileHere) =>
            fileHere.folderId == file?.folderId && fileHere.name === filename,
        ) !== -1;

      if (fileWithThatNameIsInFolderAlready) {
        return;
      }

      await ctx.prisma.file.update({
        where: { id: fileId },
        data: { name: filename },
      });

      ee.emit("renameFile", { filename, projectId: project?.id, fileId });
    }),
  update: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        change: z.any().optional(),
        requestId: z.string(),
      }),
    )
    .mutation(async ({ input: { fileId, change, requestId }, ctx }) => {
      const user = ctx.session?.user!;

      const file = await ctx.prisma.file.findFirst({
        where: { id: fileId },
      });

      if (!file) return { error: "File doesn't exist" };

      const project = await ctx.prisma.project.findFirst({
        where: { id: file?.projectId },
        include: {
          projectPermissions: true,
        },
      });

      if (!project) return { error: "Project doesn't exist" };

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return { error: "You are not authorized" };
      }

      const dmp = new diffMatchPatch();

      const patch = dmp.patch_make(file!.content, change);

      const [newText] = dmp.patch_apply(patch, file!.content);

      await ctx.prisma.file.update({
        where: { id: fileId },
        data: { content: newText },
      });

      ee.emit("updateFile", {
        change,
        projectId: project?.id,
        fileId,
        requestId,
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        folderId: z.number().optional(),
        projectId: z.number(),
        name: z.string(), // Assuming channelId is required for adding a post
      }),
    )
    .mutation(async ({ input: { folderId, projectId, name }, ctx }) => {
      const user = ctx.session?.user!;

      const project = await ctx.prisma.project.findFirst({
        where: { id: projectId },
        include: {
          projectPermissions: true,
          files: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;

      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      const fileWithThatNameIsInFolderAlready =
        project?.files.findIndex((file) => {
          console.log(file.name === name);
          return file.folderId == folderId && file.name === name;
        }) !== -1;

      if (fileWithThatNameIsInFolderAlready) {
        return;
      }

      const file = await ctx.prisma.file.create({
        data: { name, folderId, projectId, content: "" },
      });

      ee.emit("fileCreated", file);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
      }),
    )
    .mutation(async ({ input: { fileId }, ctx }) => {
      const user = ctx.session?.user!;

      const file = await ctx.prisma.file.findFirst({
        where: { id: fileId },
      });

      const project = await ctx.prisma.project.findFirst({
        where: { id: file?.projectId },
        include: {
          projectPermissions: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      await ctx.prisma.file.delete({
        where: { id: fileId },
      });

      ee.emit("deleteFile", { fileId, projectId: file?.projectId });
    }),
  move: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        projectId: z.number(),
        newFolderId: z.number().optional(),
      }),
    )
    .mutation(async ({ input: { fileId, projectId, newFolderId }, ctx }) => {
      const user = ctx.session?.user!;

      const project = await ctx.prisma.project.findFirst({
        where: { id: projectId },
        include: {
          projectPermissions: true,
          files: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      const file = project?.files.find((file) => file.id === fileId);
      const fileWithThatNameIsInFolderAlready =
        project?.files.findIndex((fileHere) => {
          return (
            fileHere.folderId == newFolderId && file?.name === fileHere.name
          );
        }) !== -1;

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
