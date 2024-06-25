"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../api/trpc");
exports.userRouter = (0, trpc_1.createTRPCRouter)({
    changeName: trpc_1.protectedProcedure
        .input(zod_1.z.object({ name: zod_1.z.string().min(2).max(32) }))
        .mutation(async ({ input: { name }, ctx }) => {
        const update = await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: { username: name },
        });
        return { update };
    }),
    getUserInfo: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const id = ctx.session.user.id;
        console.log("here");
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
        if (userInfo == null)
            return userInfo;
        return userInfo;
    }),
});
