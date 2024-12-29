import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { fetchPreloadedData, fetchTags } from "@/utils/tasty-api";
import { type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

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
  createUserRecipe: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        ingredients: z.string(),
        instructions: z.string(),
        image: z.string(),
        cook_time_minutes: z.number().optional(),
        num_servings: z.number().optional(),
        prep_time_minutes: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.userCreateRecipe.create({
        data: {
          name: input.title,
          description: input.description,
          ingredients: input.ingredients,
          instructions: input.instructions,
          thumbnail: input.image,
          createdBy: { connect: { id: ctx.session.user.id } },
          cook_time_minutes: input.cook_time_minutes ?? 0,
          num_servings: input.num_servings ?? 0,
          prep_time_minutes: input.prep_time_minutes ?? 0,
        },
      });
    }),
  getUserCreatedRecipes: protectedProcedure.query(async ({ ctx }) => {
    const userRecipes = await ctx.db.userCreateRecipe.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
    });

    return userRecipes;
  }),
  getRecipeById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.userCreateRecipe.findFirst({
        where: {
          id: input.id,
        },
        include: {
          createdBy: true,
        },
      });

      return recipe;
    }),

  getUserRecipesbyId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.userCreateRecipe.findMany({
        where: {
          createdById: input.id,
        },
      });

      return recipe;
    }),

  getAllUserRecipes: publicProcedure.query(async ({ ctx }) => {
    // id: any;
    // name: string;
    // thumbnail_url: any;
    // cook_time_minutes: number;
    // num_servings: number;
    // liked: boolean;
    const recipes = await ctx.db.userCreateRecipe.findMany();

    return recipes.map((r) => {
      return {
        id: r.id,
        name: r.name,
        thumbnail_url: r.thumbnail,
        cook_time_minutes: r.cook_time_minutes,
        num_servings: r.num_servings,
        liked: false,
      };
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
