import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { fetchPreloadedData, fetchTags } from "@/utils/tasty-api";
import { PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const recipeRouter = createTRPCRouter({
  getAllRecipesWithLikes: publicProcedure.query(async ({ ctx }) => {
    const { popular, trending, otherSections } = await fetchPreloadedData();
    const tags = await fetchTags();
    const filteredCategories = tags.results
      .filter(
        (tag: { type: string }) =>
          tag.type === "cuisine" || tag.type === "dietary",
      )
      .map((tag: { name: any; display_name: any }) => ({
        name: tag.name,
        displayName: tag.display_name,
      }));

    let userLikes: any[] = [];
    if (ctx.session?.user) {
      userLikes = await getUserLikes(ctx.session.user.id, ctx.db);
    }
    console.log("userLikes", userLikes);

    const updatedOtherSections = otherSections.map(
      (section: { items: any[] }) => {
        return {
          ...section,
          items: section.items.map((item: { id: any; liked: any }) => {
            const isLiked = userLikes.some(
              (savedRecipe: { recipeId: any }) =>
                savedRecipe.recipeId === item.id,
            );
            item.liked = isLiked;
            return item;
          }),
        };
      },
    );

    return {
      popular,
      trending,
      otherSections: updatedOtherSections,
      tags: filteredCategories,
    };
  }),
  likeOrDislikeRecipe: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
        thumbnail: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.savedRecipe.findFirst({
        where: {
          recipeId: input.recipeId,
          savedBy: { id: ctx.session.user.id },
        },
      });

      if (data) {
        return await ctx.db.savedRecipe.delete({
          where: {
            id: data.id,
          },
        });
      } else {
        return await ctx.db.savedRecipe.create({
          data: {
            recipeId: input.recipeId,
            thumbnail: input.thumbnail,
            title: input.title,
            savedBy: { connect: { id: ctx.session.user.id } },
          },
        });
      }
    }),

  getSavedRecipes: protectedProcedure.query(async ({ ctx }) => {
    const savedRecipes = await ctx.db.savedRecipe.findMany({
      where: {
        savedBy: { id: ctx.session.user.id },
      },
    });

    return savedRecipes;
  }),
  getReviews: publicProcedure
    .input(
      z.object({
        recipe_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.review.findMany({
        where: {
          recipeId: input.recipe_id,
        },
        include: { reviewedBy: true },
      });

      return reviews;
    }),

  isUserLikedRecipe: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.savedRecipe.findFirst({
        where: {
          recipeId: input.recipeId,
          savedBy: { id: ctx.session.user.id },
        },
      });

      return !!data;
    }),

  createReview: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
        rating: z.number(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.review.create({
        data: {
          recipeId: input.recipeId,
          rating: input.rating,
          comment: input.comment,
          reviewedBy: { connect: { id: ctx.session.user.id } },
        },
      });
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
