"use client";

import { RecipeCard } from "@/app/_components/RecipeCard";
import { fetchRecipes } from "@/utils/tasty-api";
import Head from "next/head"; // Import for SEO
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Category({
  category,
  recipesS,
  categories,
}: {
  category: string;
  recipesS: any[];
  categories: string[];
}) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>(recipesS);
  // const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(20); // Pagination offset
  const PAGE_SIZE = 20; // Number of recipes per API call

  // Fetch recipes for the current category
  const loadRecipes = async () => {
    setLoading(true);
    try {
      const newRecipes = await fetchRecipes(category, "", offset, PAGE_SIZE);
      setRecipes((prev) => [...prev, ...newRecipes]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setError("Failed to load recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>{category.replace(/_/g, " ").toUpperCase()} Recipes</title>
        <meta
          name="description"
          content={`Discover delicious ${category.replace(
            /_/g,
            " ",
          )} recipes. Browse easy-to-follow recipes for every occasion.`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: recipes.map((recipe, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "Recipe",
                  name: recipe.name || "Untitled Recipe",
                  image: recipe.thumbnail_url,
                  cookTime: recipe.cook_time_minutes
                    ? `PT${recipe.cook_time_minutes}M`
                    : undefined,
                  recipeCategory: category.replace(/_/g, " "),
                },
              })),
            }),
          }}
        />
      </Head>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-4xl font-bold capitalize">
          {category.replace(/_/g, " ")} Recipes
        </h1>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.name || "Untitled Recipe"}
                thumbnail={recipe.thumbnail_url}
                cookTime={recipe.cook_time_minutes}
                servings={recipe.num_servings}
                removeFromList={(id) =>
                  setRecipes(recipes.filter((recipe) => recipe.id !== id))
                }
                isLiked={recipe.liked}
              />
            ))
          ) : !loading ? (
            <p className="text-gray-600">No recipes found for this category.</p>
          ) : null}
        </div>

        {/* Load More Button */}
        {recipes.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadRecipes}
              disabled={loading}
              className="bg-primary rounded-lg px-6 py-2 font-semibold text-white shadow transition hover:bg-opacity-90"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </main>
    </>
  );
}
