import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { fetchPreloadedData, fetchTags } from "@/utils/tasty-api";
import { type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id },
      });
      if (!user) {
        return null;
      }
      const recipeCount = await ctx.db.userCreateRecipe.count({
        where: { createdBy: { id: user.id } },
      });
      const followerCount = await ctx.db.follows.count({
        where: { followingId: user.id },
      });
      const followingCount = await ctx.db.follows.count({
        where: { followerId: user.id },
      });

      return {
        ...user,
        recipeCount: recipeCount ?? 0,
        followerCount: followerCount ?? 0,
        followingCount: followingCount ?? 0,
      };
    }),
  isFollowing: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.follows.findFirst({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.id,
        },
      });
      return !!data;
    }),

  followUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.follows.findFirst({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.id,
        },
      });
      if (data) {
        return await ctx.db.follows.delete({
          where: {
            id: data.id,
          },
        });
      } else {
        return await ctx.db.follows.create({
          data: {
            followerId: ctx.session.user.id,
            followingId: input.id,
          },
        });
      }
    }),
  // hello: publicProcedure .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),
  // create: protectedProcedure
  //   .input(
  //     z.object({
  //       recipeId: z.number(),
  //       thumbnail: z.string(),
  //       title: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const data = await ctx.db.savedRecipe.findFirst({
  //       where: {
  //         recipeId: input.recipeId,
  //         savedBy: { id: ctx.session.user.id },
  //       },
  //     });
  //     if (data) {
  //       return await ctx.db.savedRecipe.delete({
  //         where: {
  //           id: data.id,
  //         },
  //       });
  //     } else {
  //       return await ctx.db.savedRecipe.create({
  //         data: {
  //           recipeId: input.recipeId,
  //           thumbnail: input.thumbnail,
  //           title: input.title,
  //           savedBy: { connect: { id: ctx.session.user.id } },
  //         },
  //       });
  //     }
  //   }),
  // getLatest: protectedProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });
  //   return post ?? null;
  // }),
  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});

async function getUserLikes(
  userId: any,
  prisma: PrismaClient<
    {
      log: ("query" | "warn" | "error")[];
    },
    never,
    DefaultArgs
  >,
) {
  return await prisma.savedRecipe.findMany({
    where: { savedBy: { id: userId } },
    select: { recipeId: true },
  });
}
