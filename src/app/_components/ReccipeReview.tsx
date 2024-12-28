import { api, RouterOutputs } from "@/trpc/react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { useState } from "react";

export const RecipeReviewCard = ({
  recipe,
  user,
  reviews,
}: {
  recipe: any;
  user: any | null;
  reviews: RouterOutputs["post"]["getReviews"];
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="my-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Review
        </button>
      </div>
      {showReviewForm && user && <ReviewForm recipeId={recipe.id} />}
      <button
        onClick={() => setShowReviews(!showReviews)}
        className="mt-4 flex items-center text-blue-500 hover:text-blue-600"
      >
        {showReviews ? "Hide Reviews" : "Show Reviews"}
        {showReviews ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )}
      </button>
      {showReviews && <ReviewList reviews={reviews} />}
    </div>
  );
};

function ReviewList({
  reviews,
}: {
  reviews: RouterOutputs["post"]["getReviews"];
}) {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-xl font-semibold">Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review, index) => (
            <li key={index} className="border-b pb-4 last:border-b-0">
              <div className="mb-2 flex items-center">
                <div className="mr-2 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="mt-1 text-sm text-gray-500">
                - {review.reviewedBy.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ReviewForm({ recipeId }: { recipeId: string }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const utils = api.useUtils();
  const createReview = api.post.createReview.useMutation({
    onSuccess: async () => {
      await utils.post.getReviews.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview.mutateAsync({
      recipeId: parseInt(recipeId),
      rating,
      comment: review,
    });
    setRating(0);
    setReview("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-2 flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="w-full rounded border p-2"
        placeholder="Write your review..."
        rows={3}
      />
      <button
        type="submit"
        className="mt-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Submit Review
      </button>
    </form>
  );
}
