"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import slugify from "slugify";

export function RecipeCard({
  id,
  title,
  thumbnail,
  cookTime,
  servings,
  removeFromList,
  isLiked,
}: {
  id: number;
  title: string;
  thumbnail: string;
  cookTime?: number;
  servings?: number;
  removeFromList?: (id: number) => void;
  isLiked?: boolean;
}) {
  const [liked, setLiked] = useState(isLiked);

  // Generate slug and recipe URL
  const slug = useMemo(
    () => slugify(title, { lower: true, strict: true }),
    [title],
  );
  const recipeUrl = `/recipes/${slug}-${id}`;
  const utils = api.useUtils();
  const likeOrDislikeRecipe = api.post.likeOrDislikeRecipe.useMutation({
    onSuccess: async () => {
      await utils.post.getAllRecipesWithLikes.invalidate();
    },
  });

  // Handle Like (Save/Unsave Recipe)
  const handleLike = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      await likeOrDislikeRecipe.mutateAsync({
        recipeId: id,
        thumbnail,
        title,
      });

      setLiked(!liked);
      console.log(`Recipe ${liked ? "unsaved" : "saved"} successfully!`);
      if (liked && removeFromList) {
        removeFromList(id);
      }
    } catch (error) {
      console.error("Error saving/unsaving recipe:", error);
    }
  };

  // Handle Share
  const handleShare = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const url = `${window.location.origin}${recipeUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Check out this recipe!",
          text: "I found this amazing recipe and wanted to share it with you!",
          url,
        });
      } else {
        alert("Sharing not supported on this browser.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Link href={recipeUrl} passHref>
      <div
        className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition hover:shadow-xl"
        key={id}
      >
        {/* Action Icons */}
        <div className="absolute left-2 top-2 z-10 flex flex-col space-y-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            aria-label="Like"
            className={`rounded-full p-2 shadow transition ${
              liked ? "bg-red-600 text-white" : "bg-white text-gray-700"
            } hover:bg-primary group`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill={liked ? "currentColor" : "none"}
              stroke={liked ? "white" : "currentColor"}
              strokeWidth="1.5"
              className="transition group-hover:stroke-white"
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="Share"
            className="hover:bg-primary group rounded-full bg-white p-2 shadow transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="group-hover:stroke-white"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 4.98" />
              <path d="M15.41 5.51l-6.82 4.98" />
            </svg>
          </button>
        </div>

        {/* Recipe Image */}
        <div className="relative h-48 w-full">
          <Image
            src={thumbnail || "/placeholder.png"}
            alt={title || "Recipe Image"}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <h3 className="text-secondary mb-2 line-clamp-2 text-lg font-bold">
            {title || "No Title"}
          </h3>

          {/* Cook Time & Servings */}
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            {cookTime && (
              <div className="flex items-center space-x-1">
                <Image
                  src="/cooktime.svg"
                  alt="Cook Time"
                  width={20}
                  height={20}
                />
                <span>{cookTime} mins</span>
              </div>
            )}
            {servings && (
              <div className="flex items-center space-x-1">
                <Image src="/serve.svg" alt="Serves" width={20} height={20} />
                <span>Serves {servings}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
