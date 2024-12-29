import { fetchRecipes, fetchTags } from "@/utils/tasty-api";
import Link from "next/link";
import { Category } from "./Categories";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { RouterOutputs } from "@/trpc/react";

const PAGE_SIZE = 20; // Number of recipes per API call
export default async function CategoryPage({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}) {
  const category = (await params).category;
  const recipes = await fetchRecipes(category, "", 0, PAGE_SIZE);

  const tags = await fetchTags();
  const categories = tags.results
    .filter(
      (tag: { type: string }) =>
        tag.type === "cuisine" || tag.type === "dietary",
    )
    .map((tag: { name: any }) => tag.name);

  let userSavedRecipes: RouterOutputs["post"]["getSavedRecipes"] = [];
  const session = await auth();

  if (session) {
    userSavedRecipes = await api.post.getSavedRecipes();
  }

  const recipesWithLikes = recipes.map((recipe: any) => {
    return {
      ...recipe,
      isLiked: userSavedRecipes.some((v) => v.recipeId === recipe.id),
    };
  });

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-1/4 bg-gray-100 p-6 lg:block">
          <h2 className="mb-4 text-lg font-bold">Categories</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/`}
                className="w-full rounded-lg px-4 py-2 text-left text-primary transition hover:bg-primary hover:text-white"
              >
                Home
              </Link>
            </li>
            {categories.map((cat: any) => (
              <li key={cat}>
                <Link
                  href={`/categories/${cat}`}
                  className={`w-full rounded-lg px-4 py-2 text-left transition hover:bg-primary hover:text-white ${
                    cat === category ? "bg-primary text-white" : "text-gray-700"
                  }`}
                >
                  {cat.replace(/_/g, " ").toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <Category
          category={category}
          recipesS={recipesWithLikes}
          categories={categories}
        />
      </div>
    </>
  );
}
