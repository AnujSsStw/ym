"use client";

import { RecipeReviewCard } from "@/app/_components/ReccipeReview";
import { RecipeCard } from "@/app/_components/RecipeCard";
import { api, type RouterOutputs } from "@/trpc/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { type Key, useCallback, useState } from "react";
import slugify from "slugify";

export function RecipeDetailsClient({
  recipe,
  categories,
  relatedRecipes = [],
  isUserSaved = false,
  user,
  reviews,
}: {
  recipe: RouterOutputs["post"]["getRecipeById"];
  categories: any[];
  relatedRecipes?: any[];
  isUserSaved?: boolean;
  user?: any;
  reviews: RouterOutputs["post"]["getReviews"];
}) {
  const [isSaved, setIsSaved] = useState(isUserSaved);
  const handleL = api.post.likeOrDislikeRecipe.useMutation();
  if (!recipe) {
    return (
      <div className="p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-500">
          Recipe Not Found
        </h1>
        <Link
          href="/"
          className="text-primary underline transition hover:text-secondary"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Generate a slug for the recipe
  const recipeSlug = slugify(recipe.name, { lower: true, strict: true });
  const recipeUrl = `/recipes/${recipeSlug}-${recipe.id}`;

  // Toggle save/unsave functionality
  const toggleSave = useCallback(async () => {
    if (!user) {
      alert("Please log in to save recipes!");
      return;
    }

    try {
      await handleL.mutateAsync({
        recipeId: recipe.id,
        thumbnail: recipe.thumbnail,
        title: recipe.name,
      });
      setIsSaved((prev) => !prev);
      console.log(
        isSaved ? "Recipe removed from saved recipes." : "Recipe saved!",
      );
    } catch (error) {
      console.error("Error saving or removing recipe:", error);
      alert("An error occurred while saving or removing the recipe.");
    }
  }, [isSaved, recipe]);

  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    image: recipe.thumbnail,
    description: recipe.description || "A delicious recipe to try out.",
    // recipeIngredient: recipe.sections?.flatMap(
    //   (section: { components: any[] }) =>
    //     section.components.map((item: { raw_text: any }) => item.raw_text),
    // ),
    // recipeInstructions: recipe.instructions?.map(
    //   (step: { display_text: any }) => step.display_text,
    // ),
    cookTime: `PT${recipe.cook_time_minutes || 0}M`,
    prepTime: `PT${recipe.prep_time_minutes || 0}M`,
    recipeYield: `${recipe.num_servings || 1} serving(s)`,
    keywords: categories.map((cat) => cat.name).join(", "),
  };

  const renderDetails = (text: any) => (
    <div
      dangerouslySetInnerHTML={{ __html: text }}
      className="recipe-details"
    ></div>
  );

  return (
    <>
      <Head>
        <title>{recipe.name} - Yummy Hub</title>
        <meta
          name="description"
          content={`Learn how to make ${recipe.name}. Serves ${recipe.num_servings} and takes ${recipe.cook_time_minutes} minutes.`}
        />
        <meta
          name="keywords"
          content={`${recipe.name}, recipes, cooking, ${categories
            .map((cat) => cat.displayName)
            .join(", ")}`}
        />
        <link
          rel="canonical"
          href={`${
            process.env.NEXT_PUBLIC_BASE_URL || "https://yourwebsite.com"
          }${recipeUrl}`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden min-h-screen w-1/4 bg-gray-100 p-6 lg:block">
          <h2 className="mb-4 text-2xl font-bold text-secondary">Categories</h2>
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={`/categories/${category.name}`}
                  className="block text-gray-700 transition hover:text-primary"
                >
                  {category.displayName}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/"
              className="font-semibold text-primary underline hover:text-secondary"
            >
              Back to Home
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-secondary">
                {recipe.name}
              </h1>
              <span>
                by{" "}
                <Link href={`/user/${recipe.createdBy.id}`}>
                  <span className="cursor-pointer text-orange-500 underline transition hover:text-orange-700">
                    {recipe.createdBy.name || "Anonymous"}
                  </span>
                </Link>{" "}
                on {new Date(recipe.createdAt).toLocaleDateString()}
              </span>
              {
                // display rating
                reviews && reviews.length > 0 ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-gray-700">
                      {reviews.length} review(s)
                    </span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, index) => (
                        <svg
                          key={index}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`h-5 w-5 ${
                            index <
                            Math.round(
                              // @ts-ignore
                              reviews.reduce(
                                (acc, review) => acc + review.rating,
                                0,
                                // @ts-ignore
                              ) / reviews.length,
                            )
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )
              }
            </div>
            <button
              onClick={toggleSave}
              className={`rounded-full p-2 shadow transition ${
                isSaved ? "bg-red-600 text-white" : "bg-white text-gray-700"
              } group hover:bg-primary`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill={isSaved ? "currentColor" : "none"}
                stroke={isSaved ? "white" : "currentColor"}
                strokeWidth="1.5"
              >
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
          </div>

          {/* Recipe Image */}
          {recipe.thumbnail && (
            <div className="relative mb-6 h-96 w-full">
              <Image
                src={recipe.thumbnail}
                alt={recipe.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Sponsored Section */}
          <section className="mb-6 rounded-lg border-l-4 border-orange-500 bg-orange-100 p-4 shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-orange-600">
              Save £1000+ on Your Groceries This Year!
            </h2>
            <p className="text-gray-700">
              Compare prices and discover the best supermarket deals at{" "}
              <a
                href="https://mysupermarketcompare.co.uk"
                target="_blank"
                rel="dofollow"
                className="font-semibold text-primary underline transition hover:text-secondary"
              >
                MySupermarket Compare
              </a>
            </p>
          </section>

          {/* Recipe Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-primary">Details</h2>
              <ul className="space-y-2 text-gray-700">
                {recipe.cook_time_minutes && (
                  <li className="flex items-center space-x-2">
                    <Image
                      src="/cooktime.svg"
                      alt="Cook Time"
                      width={20}
                      height={20}
                    />
                    <span>Cook Time: {recipe.cook_time_minutes} mins</span>
                  </li>
                )}
                {recipe.num_servings && (
                  <li className="flex items-center space-x-2">
                    <Image
                      src="/serve.svg"
                      alt="Servings"
                      width={20}
                      height={20}
                    />
                    <span>Servings: {recipe.num_servings}</span>
                  </li>
                )}
                {recipe.description && (
                  <li>{renderDetails(recipe.description)}</li>
                )}
              </ul>
            </div>

            {/* Ingredients */}
            {
              <div>
                <h2 className="mb-3 text-2xl font-bold text-primary">
                  Ingredients
                </h2>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {recipe.ingredients
                    .split("\n")
                    .filter((v) => {
                      return v !== "";
                    })
                    .map((item, index) => (
                      <li key={index}>
                        {item || "No ingredient details available"}
                      </li>
                    ))}
                </ul>
              </div>
            }
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div className="mt-6">
              <h2 className="mb-3 text-2xl font-bold text-primary">
                Instructions
              </h2>
              <ol className="list-inside list-decimal space-y-2 text-gray-700">
                {recipe.instructions
                  .split("\n")
                  .filter((v) => {
                    return v !== "";
                  })
                  .map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
              </ol>
            </div>
          )}

          <RecipeReviewCard reviews={reviews} recipe={recipe} user={user} />

          {/* Related Recipes */}
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-secondary">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedRecipes.length > 0 ? (
                relatedRecipes.map((related) => (
                  <RecipeCard
                    key={related.id}
                    id={related.id}
                    title={related.name}
                    thumbnail={related.thumbnail_url}
                    cookTime={related.cook_time_minutes}
                    servings={related.num_servings}
                    // isLiked={isSaved}
                  />
                ))
              ) : (
                <p className="text-gray-500">No related recipes found.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
