import { fetchTags } from "@/utils/tasty-api";
import Link from "next/link"; // Added Link for navigation
import { Key } from "react";
import { MyRecipes } from "./Myrecipes";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function MyRecipesPage() {
  const session = await auth();
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

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden min-h-screen w-1/4 bg-gray-100 p-6 lg:block">
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
        {/* Back to Home Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-primary hover:text-secondary font-semibold underline transition"
          >
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <MyRecipes UserRecipes={user_saved_recipes} />
    </div>
  );
}
