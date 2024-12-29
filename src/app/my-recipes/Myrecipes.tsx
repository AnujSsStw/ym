"use client";
import { RecipeCard } from "@/app/_components/RecipeCard";
import { RouterOutputs } from "@/trpc/react";
import Link from "next/link";
import { Key, useState } from "react";

export const MyRecipes = ({
  UserRecipes,
  userCreatedR,
}: {
  UserRecipes: RouterOutputs["post"]["getSavedRecipes"];
  userCreatedR: RouterOutputs["post"]["getUserCreatedRecipes"];
}) => {
  const [recipes, setRecipes] = useState(UserRecipes);

  return (
    <main className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Saved Recipes</h1>

        <Link href="/create-recipe">
          <button className="rounded-md border bg-orange-500 p-2 text-white">
            Create recipe
          </button>
        </Link>
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard
                id={recipe.recipeId}
                title={recipe.title}
                thumbnail={
                  recipe.thumbnail || "https://via.placeholder.com/300x200"
                }
                removeFromList={(id) => {
                  setRecipes(
                    recipes.filter((recipe) => recipe.recipeId !== id),
                  );
                }}
                isLiked={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>You have no saved recipes yet.</p>
      )}

      <h1 className="my-3 text-3xl font-bold">My Created Recipes</h1>

      {userCreatedR && userCreatedR.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {userCreatedR.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard
                id={recipe.id}
                title={`${recipe.name}`}
                thumbnail={
                  recipe.thumbnail || "https://via.placeholder.com/300x200"
                }
                isUserCreated={true}
                isLiked={
                  UserRecipes.some((r) => r.recipeId === recipe.id) || false
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <p>You have no created recipes yet.</p>
      )}
    </main>
  );
};
