import { api } from "@/trpc/server";
import { UserProfile } from "./UserProfile";
import { auth } from "@/server/auth";
import { RecipeCard } from "@/app/_components/RecipeCard";

export default async function UserRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await api.user.getProfile({ id: id });
  const session = await auth();

  let isFollowing = false;
  if (session?.user) {
    isFollowing = await api.user.isFollowing({ id });
  }

  const userRecipes = await api.post.getUserRecipesbyId({
    id: id,
  });

  const userCreatedRecipe = await api.post.getUserRecipesbyId({
    id,
  });

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="mb-6 text-2xl font-bold">Featured Chef</h2>
      <UserProfile data={user} isFollowing={isFollowing} usr={session?.user} />

      <h2 className="my-6 text-2xl font-bold">Recipes</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userRecipes ? (
          userRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              thumbnail={recipe.thumbnail}
              title={recipe.name}
              cookTime={recipe.cook_time_minutes}
              // prepTime={recipe.prep_time_minutes}
              servings={recipe.servings}
              isLiked={userCreatedRecipe.some(
                (savedRecipe) => savedRecipe.id === recipe.id,
              )}
            />
          ))
        ) : (
          <p>No recipes found</p>
        )}
      </div>
    </div>
  );
}
