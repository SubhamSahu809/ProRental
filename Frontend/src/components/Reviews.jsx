import { useState } from "react";
import { Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";
import { formatDate } from "../utils/property";

export default function Reviews({ listingId, ownerId, reviews, onChange }) {
  const { user, openLogin } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user && ownerId === user.id;
  const alreadyReviewed = user && reviews.some((r) => r.author?._id === user.id);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    setSubmitting(true);
    setError("");
    try {
      const data = await api(`/api/listings/${listingId}/reviews`, { method: "POST", body: { review: { rating, comment } } });
      onChange([data.review, ...reviews]);
      setRating(0);
      setComment("");
      toast("Thanks for your review!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api(`/api/listings/${listingId}/reviews/${reviewId}`, { method: "DELETE" });
      onChange(reviews.filter((r) => r._id !== reviewId));
      toast("Review deleted");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 id="reviews-heading" className="text-2xl font-bold text-gray-900">Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-gray-700">
            <StarRating value={average} />
            <span className="font-semibold">{average.toFixed(1)}</span>
            <span className="text-gray-500">({reviews.length})</span>
          </span>
        )}
      </div>

      {!user ? (
        <p className="mb-6 text-gray-600">
          <button onClick={openLogin} className="text-blue-600 hover:underline font-medium">Sign in</button> to write a review.
        </p>
      ) : !isOwner && !alreadyReviewed ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 rounded-2xl p-5 space-y-3">
          <p className="font-medium text-gray-900">Write a review</p>
          <StarRating value={rating} onChange={(v) => { setRating(v); setError(""); }} />
          <label htmlFor="review-comment" className="sr-only">Your review</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
            minLength={3}
            maxLength={1000}
            placeholder="How was the property, the owner, the neighbourhood?"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className="px-5 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50">
            {submitting ? "Posting..." : "Post review"}
          </button>
        </form>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.author ? `${review.author.firstName} ${review.author.lastName || ""}` : "Former user"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <StarRating value={review.rating} size={14} />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {user && review.author?._id === user.id && (
                  <button onClick={() => handleDelete(review._id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete review">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
