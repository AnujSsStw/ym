const API_KEY = process.env.NEXT_PUBLIC_TASTY_API_KEY!;
const API_HOST = process.env.NEXT_PUBLIC_TASTY_API_HOST!;
const BASE_URL = "https://tasty.p.rapidapi.com";

export const fetchRecipes = async (
  tag: string = "",
  query: string = "",
  from: number = 0,
  size: number = 20
) => {
  try {
    const url = new URL(`${BASE_URL}/recipes/list`);
    url.searchParams.append("from", from.toString());
    url.searchParams.append("size", size.toString());

    if (tag) url.searchParams.append("tags", tag);
    if (query) url.searchParams.append("q", query);

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
      // cache: "force-cache",
    });

    if (!res.ok) {
      console.error(
        `Error fetching recipes: ${res.status} - ${res.statusText}`
      );
      return [];
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Network/API Error fetching recipes:", error);
    return [];
  }
};

export const fetchRecipeDetails = async (id: string) => {
  try {
    if (!id) throw new Error("Recipe ID is required to fetch details.");

    const url = `${BASE_URL}/recipes/get-more-info?id=${id}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEY!,
        "x-rapidapi-host": API_HOST!,
      },
      // cache: "force-cache",
    });

    if (!res.ok) {
      console.error(
        `Error fetching recipe details: ${res.status} - ${res.statusText}`
      );
      return null;
    }

    const data = await res.json();
    if (!data || Object.keys(data).length === 0) {
      console.warn("No recipe details found for the given ID.");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Network/API Error fetching recipe details:", error);
    return null;
  }
};

export const fetchFeeds = async (): Promise<any | null> => {
  try {
    const url = `${BASE_URL}/feeds/list`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
      // cache: "force-cache",
    });

    if (!res.ok) {
      console.error(`Error fetching feeds: ${res.status} - ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Network/API Error fetching feeds:", error);
    return null;
  }
};

export const fetchTags = async () => {
  try {
    const url = `${BASE_URL}/tags/list`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
    });

    if (!res.ok) {
      console.error(`Error fetching tags: ${res.status} - ${res.statusText}`);
      return { results: [] };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Network/API Error fetching tags:", error);
    return { results: [] };
  }
};

export async function fetchPreloadedData() {
  try {
    const feeds = await fetchFeeds();
    if (!feeds) {
      return { popular: [], trending: [], otherSections: [] };
    }

    // Handle Popular Recipes Feed
    const popular = feeds.results
      .filter((item: { type: string }) => item.type === "popular_recipes") // Match the correct feed type
      .flatMap(
        (item: { items: any; item: any }) =>
          item.items || (item.item ? [item.item] : [])
      ) // Flatten both `items` and `item`
      .filter((recipe: { thumbnail_url: any }) => recipe.thumbnail_url); // Ensure recipes have valid thumbnails

    // Handle Trending Recipes Feed
    const trending = feeds.results
      .filter((item: { type: string }) => item.type === "trending") // Match the correct feed type
      .flatMap(
        (item: { items: any; item: any }) =>
          item.items || (item.item ? [item.item] : [])
      ) // Flatten both `items` and `item`
      .filter((recipe: { thumbnail_url: any }) => recipe.thumbnail_url); // Ensure recipes have valid thumbnails

    // Handle Other Sections
    const otherSections = feeds.results.filter(
      (item: { items: any[]; type: string }) =>
        item.items?.length &&
        item.items.some(
          (subItem: { thumbnail_url: any }) => subItem.thumbnail_url
        ) && // Ensure sub-items have thumbnails
        ![
          "featured",
          "creator_carousel",
          "holiday_eats_made_easy",
          "popular_recipes",
          "trending",
          "budget_friendly_bites",
        ].includes(item.type) // Exclude unwanted feed types
    );

    return { popular, trending, otherSections };
  } catch (err) {
    console.error("Failed to prefetch feeds:", err);
    return { popular: [], trending: [], otherSections: [] };
  }
}
