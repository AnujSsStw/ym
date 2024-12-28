import { RecipeCard } from "@/app/_components/RecipeCard";
import { api } from "@/trpc/server";
import { fetchRecipes, fetchTags } from "@/utils/tasty-api"; // Import API methods
import Link from "next/link";
import { Key } from "react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query: string }>;
}) {
  const query = (await searchParams) || ""; // Get the query from URL parameters
  const recipes = await fetchRecipes("", query.query); // Fetch recipes based on the query
  const tags = await fetchTags(); // Fetch categories for sidebar

  const userSavedRecipes = await api.post.getSavedRecipes();

  const recipesWithLikes = recipes.map((recipe: any) => {
    return {
      ...recipe,
      isLiked: userSavedRecipes.some((v) => v.recipeId === recipe.id),
    };
  });

  const categories = tags.results
    .filter(
      (tag: { type: string }) =>
        tag.type === "cuisine" || tag.type === "dietary",
    )
    .map((tag: { name: any; display_name: any }) => ({
      name: tag.name,
      displayName: tag.display_name,
    }));

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden h-full min-h-screen w-1/4 bg-gray-100 p-6 lg:block">
        <h2 className="text-secondary mb-4 text-2xl font-bold">Categories</h2>
        <ul className="space-y-3">
          {categories.map(
            (category: { name: Key | null | undefined; displayName: any }) => (
              <li key={category.name}>
                <Link
                  href={`/categories/${category.name}`}
                  className="hover:text-primary block text-gray-700 transition"
                >
                  {category.displayName}
                </Link>
              </li>
            ),
          )}
        </ul>
        <div className="mt-8">
          <Link
            href="/"
            className="text-primary hover:text-secondary font-semibold underline"
          >
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-secondary mb-6 text-4xl font-bold">
          Search Results for:{" "}
          <span className="text-primary">{query.query}</span>
        </h1>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {recipesWithLikes.map((recipe: any) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.name}
                thumbnail={recipe.thumbnail_url}
                cookTime={recipe.cook_time_minutes}
                servings={recipe.num_servings}
                isLiked={recipe.isLiked}
              />
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600">
            No recipes found. Try searching with different keywords.
          </p>
        )}
      </main>
    </div>
  );
}
