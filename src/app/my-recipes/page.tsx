import { fetchTags } from "@/utils/tasty-api";
import Link from "next/link"; // Added Link for navigation
import { type Key } from "react";
import { MyRecipes } from "./Myrecipes";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function MyRecipesPage() {
  const session = await auth();
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

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
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const user_saved_recipes = await api.post.getSavedRecipes();
  const user_created_recipes = await api.post.getUserCreatedRecipes();

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden min-h-screen w-1/4 bg-gray-100 p-6 lg:block">
        <h2 className="mb-4 text-2xl font-bold text-secondary">Categories</h2>
        <ul className="space-y-3">
          {categories.map(
            (category: { name: Key | null | undefined; displayName: any }) => (
              <li key={category.name}>
                <Link
                  href={`/categories/${category.name}`}
                  className="block text-gray-700 transition hover:text-primary"
                >
                  {category.displayName}
                </Link>
              </li>
            ),
          )}
        </ul>
        {/* Back to Home Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="font-semibold text-primary underline transition hover:text-secondary"
          >
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <MyRecipes
        UserRecipes={user_saved_recipes}
        userCreatedR={user_created_recipes}
      />
    </div>
  );
}
