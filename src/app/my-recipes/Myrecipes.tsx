"use client";
import { RecipeCard } from "@/app/_components/RecipeCard";
import { RouterOutputs } from "@/trpc/react";
import { Key, useState } from "react";

export const MyRecipes = ({
  UserRecipes,
}: {
  UserRecipes: RouterOutputs["post"]["getSavedRecipes"];
}) => {
  const [recipes, setRecipes] = useState(UserRecipes);

  return (
    <main className="flex-1 p-6">
      <h1 className="mb-6 text-3xl font-bold">My Saved Recipes</h1>
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
    </main>
  );
};
