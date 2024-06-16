import { EventEmitter } from "events";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../trpc";
import { Folder } from "~/types/Project";
import { Project } from "@prisma/client";
// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();
const t = initTRPC.create();

export const folderRouter = t.router({
  onFolderCreated: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFolderCreated = (folder: {
          id: number;
          name: string;
          projectId: number;
          parentId: number | null;
        }) => {
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
          foldername,
          projectId,
          folderId,
        }: {
          foldername: string;
          projectId: number;
          folderId: number;
        }) => {
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
  onFolderDeleted: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFolderDeleted = ({
          folderId,
          projectId,
        }: {
          folderId: number;
          projectId: number;
        }) => {
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
  onFolderMove: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
      }),
    )
    .subscription(async (opts) => {
      const input = opts.input;
      return observable<any>((emit) => {
        const onFolderMove = ({
          folderId,
          projectId,
          newFolderId,
        }: {
          folderId: number;
          projectId: number;
          newFolderId: number;
        }) => {
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
  create: protectedProcedure
    .input(
      z.object({
        folderId: z.number().optional(),
        projectId: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input: { folderId, projectId, name }, ctx }) => {
      const user = ctx.session?.user!;

      const project = await ctx.prisma.project.findFirst({
        where: { id: projectId },
        include: {
          projectPermissions: true,
          folders: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return;
      }
      const folderWithThatNameAlreadyExistInSameDictionary =
        project?.folders.findIndex((folder) => {
          return folder.parentId == folderId && folder.name === name;
        }) !== -1;

      if (folderWithThatNameAlreadyExistInSameDictionary) {
        return;
      }

      const folder = await ctx.prisma.folder.create({
        data: { name, parentId: folderId, projectId },
      });

      ee.emit("folderCreated", folder);
    }),
  rename: protectedProcedure
    .input(
      z.object({
        folderId: z.number(),
        foldername: z.string(),
      }),
    )
    .mutation(async ({ input: { folderId, foldername }, ctx }) => {
      const user = ctx.session?.user!;

      const folder = await ctx.prisma.folder.findFirst({
        where: { id: folderId },
      });

      const project = await ctx.prisma.project.findFirst({
        where: { id: folder?.projectId },
        include: {
          projectPermissions: true,
          folders: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      const folderWithThatNameAlreadyExistInSameDictionary =
        project?.folders.findIndex(
          (folder) => folder.parentId == folderId && folder.name === foldername,
        ) !== -1;

      if (folderWithThatNameAlreadyExistInSameDictionary) {
        return;
      }

      await ctx.prisma.folder.update({
        where: { id: folderId },
        data: { name: foldername },
      });

      ee.emit("renameFolder", { foldername, projectId: project?.id, folderId });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .mutation(async ({ input: { folderId }, ctx }) => {
      const user = ctx.session?.user!;

      const folder = await ctx.prisma.folder.findFirst({
        where: { id: folderId },
      });

      const project = await ctx.prisma.project.findFirst({
        where: { id: folder?.projectId },
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

      await ctx.prisma.folder.delete({
        where: { id: folderId },
      });

      ee.emit("deleteFolder", { folderId, projectId: folder?.projectId });
    }),
  move: protectedProcedure
    .input(
      z.object({
        folderId: z.number(),
        projectId: z.number(),
        newFolderId: z.number().optional(),
      }),
    )
    .mutation(async ({ input: { folderId, projectId, newFolderId }, ctx }) => {
      const user = ctx.session?.user!;

      if (folderId === newFolderId) return;

      const project = await ctx.prisma.project.findFirst({
        where: { id: projectId },
        include: {
          projectPermissions: true,
          folders: true,
        },
      });

      const userHasPermission = project!.projectPermissions.find(
        (permission) => permission.userId === user.id,
      );
      const userIsAuthor = project!.authorId === user.id;
      if (!userIsAuthor && !userHasPermission) {
        return;
      }

      const folder = project?.folders.find((folder) => folder.id === folderId);
      const folderWithThatNameAlreadyExistInSameDictionary =
        project?.folders.findIndex((folderHere) => {
          folderHere.parentId == newFolderId &&
            folderHere.name === folder?.name;
        }) !== -1;

      if (folderWithThatNameAlreadyExistInSameDictionary) {
        return;
      }

      const groupFolder: { [key: string]: Folder[] } = {};

      project?.folders.forEach((folder) => {
        if (folder.parentId == null) {
          return;
        }
        //ignoring warning since group is always created before adding
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        groupFolder[folder.parentId] ||= [];
        groupFolder[folder.parentId]!.push(folder);
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

const isSubFolderRecursive = (
  folderId: number,
  newFolderId: number | undefined,
  groupFolder: {
    [key: string]: Folder[];
  },
): boolean => {
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
