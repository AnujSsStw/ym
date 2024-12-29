import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Header } from "./_components/Header";
import HomeClient from "./_components/HomeClient";

export default async function Home() {
  const data = await api.post.getAllRecipesWithLikes();
  const usrR = await api.post.getAllUserRecipes();
  const session = await auth();
  if (session) {
    const userLiked = await api.post.getSavedRecipes();
    usrR.map((recipe) => {
      const liked = userLiked.find((r) => r.recipeId === recipe.id);

      return {
        ...recipe,
        liked: !!liked,
      };
    });
  }

  return (
    <HydrateClient>
      <HomeClient
        otherSections={data.otherSections}
        popular={data.popular}
        trending={data.trending}
        categories={data.tags}
        userRecipes={usrR}
      />
    </HydrateClient>
  );
}
