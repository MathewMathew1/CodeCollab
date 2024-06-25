import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../api/trpc";

export const userRouter = createTRPCRouter({
  changeName: protectedProcedure
    .input(z.object({ name: z.string().min(2).max(32) }))
    .mutation(async ({ input: { name }, ctx }) => {
      const update = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { username: name },
      });

      return { update };
    }),
  getUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const id = ctx.session.user.id;
    console.log("here")
    const userInfo = await ctx.prisma.user.findFirst({
      where: { id: id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        projects: true,
        projectPermissions: {
          include: {
            project: true,
          },
        },
      },
    });

    if (userInfo == null) return userInfo;

    return userInfo
  }),
});
