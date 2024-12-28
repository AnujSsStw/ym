"use client";

import { RecipeCard } from "@/app/_components/RecipeCard";
import { fetchRecipes } from "@/utils/tasty-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useRef, useState } from "react";

const RecipeSection = React.memo(function RecipeSection({
  title,
  recipes,
}: {
  title: string;
  recipes: any[];
}) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-secondary mb-6 text-3xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {recipes.map((recipe) => {
          return (
            <Suspense
              fallback={<div>Loading...</div>}
              key={recipe.id || recipe.name}
            >
              <RecipeCard
                id={recipe.id}
                title={recipe.name}
                thumbnail={recipe.thumbnail_url}
                cookTime={recipe.cook_time_minutes}
                servings={recipe.num_servings}
                isLiked={recipe.liked}
              />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
});

export default function HomeClient({
  popular,
  trending,
  otherSections,
  categories,
}: {
  popular: any[];
  trending: any[];
  otherSections: any[];
  categories?: { name: string; displayName: string }[];
}) {
  // const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [otherSectionsState, setOtherSectionsState] = useState(otherSections);

  const dropdownRef = useRef(null);
  const router = useRouter();

  // Handle search suggestions
  const fetchSuggestions = async (query: string | undefined) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const results = await fetchRecipes("", query, 0, 5);
      setSuggestions(results);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearchChange = (e: { target: { value: any } }) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-white">
      <h1 className="text-center text-2xl font-bold">
        {" "}
        Easy recipes. Delicious results.
      </h1>
      {/* Search Section */}
      <section className="relative p-6 text-center">
        <div className="relative flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by recipe or ingredients"
              className="focus:ring-primary w-full rounded-l-lg border p-3 focus:outline-none focus:ring-2"
              onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            {suggestions.length > 0 && (
              <ul
                ref={dropdownRef}
                className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg"
              >
                {loadingSuggestions ? (
                  <li className="p-3 text-center text-gray-500">Loading...</li>
                ) : (
                  suggestions.map(
                    (recipe: { id: any; name: string; thumbnail_url: any }) => (
                      <li
                        key={recipe.id || recipe.name}
                        className="border-b p-3 transition hover:bg-gray-100"
                      >
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="flex items-center space-x-4"
                          onClick={() => setSuggestions([])}
                        >
                          <img
                            src={
                              recipe.thumbnail_url ||
                              "https://via.placeholder.com/50x50?text=No+Image"
                            }
                            alt={recipe.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <span className="text-sm text-gray-700">
                            {recipe.name}
                          </span>
                        </Link>
                      </li>
                    ),
                  )
                )}
              </ul>
            )}
          </div>
          <button
            onClick={handleSearchSubmit}
            className="bg-primary rounded-r-lg px-6 text-white transition hover:bg-opacity-90"
          >
            Search
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!categories ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name}`}
              className="hover:bg-primary rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:text-white"
            >
              {category.displayName.toUpperCase()}
            </Link>
          ))
        )}
      </div>

      {/* Sponsored Section */}
      <section className="mx-4 my-6 rounded-lg border-l-4 border-orange-500 bg-orange-100 p-6">
        <h2 className="mb-2 text-2xl font-bold text-orange-600">
          Save £1000+ on Your Groceries This Year!
        </h2>
        <p className="mb-4">
          Compare prices and discover the best supermarket deals at{" "}
          <a
            href="https://mysupermarketcompare.co.uk/"
            className="text-primary hover:text-secondary font-semibold underline transition"
            target="_blank"
            rel="dofollow"
          >
            MySupermarket Compare
          </a>
        </p>
      </section>

      {/* Recipe Sections */}
      <section className="bg-white p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RecipeSection title="Popular Recipes This Week" recipes={popular} />
          <RecipeSection title="Trending Recipes" recipes={trending} />
          {otherSectionsState.map((section, index) =>
            section.items.filter(
              (item: { thumbnail_url: any }) => item.thumbnail_url,
            ).length > 0 ? (
              <RecipeSection
                key={index}
                title={section.name || "Other Recipes"}
                recipes={section.items.filter(
                  (item: { thumbnail_url: any }) => item.thumbnail_url,
                )}
              />
            ) : null,
          )}
        </Suspense>
      </section>
    </div>
  );
}
