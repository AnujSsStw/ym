import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { fetchRecipeDetails, fetchRecipes, fetchTags } from "@/utils/tasty-api";
import Link from "next/link";
import { RecipeDetailsClient } from "./RecipeDetailsClient";
export default async function UserRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await api.post.getRecipeById({
    id: parseInt(id),
  });

  if (!recipe) {
    return (
      <div className="p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-500">
          Recipe Not Found
        </h1>
        <Link
          href="/"
          className="text-primary underline transition hover:text-secondary"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Fetch tags to create categories
  const tags = await fetchTags();
  const categories = tags.results
    .filter(
      (tag: { type: string }) =>
        tag.type === "cuisine" || tag.type === "dietary",
    )
    .map((tag: { name: any; display_name: any }) => ({
      name: tag.name,
      displayName: tag.display_name,
    }));

  // Fetch related recipes based on the first tag of the recipe
  const relatedRecipes: any[] = [];
  //   if (recipe.tags && recipe.tags.length > 0) {
  //     const firstTag = recipe.tags[0].name; // Use the first tag name
  //     relatedRecipes = await fetchRecipes(firstTag, "", 0, 6); // Fetch up to 6 related recipes
  //   }

  const reviews = await api.post.getReviews({
    recipe_id: recipe.id,
  });
  let isUserSaved = false;
  const session = await auth();
  if (session?.user) {
    isUserSaved = await api.post.isUserLikedRecipe({
      recipeId: recipe.id,
    });
  }

  return (
    <RecipeDetailsClient
      recipe={recipe}
      categories={categories}
      relatedRecipes={relatedRecipes}
      isUserSaved={isUserSaved}
      reviews={reviews}
      user={session?.user}
    />
  );
}
