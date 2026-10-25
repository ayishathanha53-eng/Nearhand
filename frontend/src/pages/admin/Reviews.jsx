
import { useEffect, useState } from "react";
import { Star, RefreshCw, LoaderCircle, MessageSquareText } from "lucide-react";
import "./reviews.css";

const API_URL = "http://localhost:5000";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [providerFilter, setProviderFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      const response = await fetch(`${API_URL}/api/reviews/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating) || 0);
      setTotalReviews(Number(data.totalReviews) || 0);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating) => (
    <span className="admin-review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= Number(rating) ? "currentColor" : "none"}
          className={star <= Number(rating) ? "filled" : "empty"}
        />
      ))}
    </span>
  );

  const providers = [
    ...new Map(
      reviews
        .filter((review) => review.provider?._id)
        .map((review) => [
          review.provider._id,
          {
            id: review.provider._id,
            name: review.provider.fullName || "Unnamed provider",
          },
        ])
    ).values(),
  ];

  const filteredReviews = reviews.filter((review) => {
    const matchesProvider =
      providerFilter === "all" ||
      review.provider?._id === providerFilter;

    const matchesRating =
      ratingFilter === "all" ||
      Number(review.rating) === Number(ratingFilter);

    return matchesProvider && matchesRating;
  });

  if (loading) {
    return (
      <main className="admin-reviews-page">
        <div className="admin-reviews-state">
          <LoaderCircle className="admin-reviews-spinner" size={30} />
          <p>Loading all customer reviews...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-reviews-page">
        <div className="admin-reviews-state">
          <h2>Unable to load reviews</h2>
          <p>{error}</p>
          <button onClick={loadReviews} className="admin-review-button">
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-reviews-page">
      <header className="admin-reviews-heading">
        <div>
          <p className="admin-reviews-eyebrow">PLATFORM MANAGEMENT</p>
          <h1>Customer Reviews</h1>
          <p>Monitor customer feedback across all service providers.</p>
        </div>

        <button
          className="admin-review-button"
          onClick={loadReviews}
          type="button"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="admin-review-stats">
        <div className="admin-review-stat">
          <span>All reviews</span>
          <strong>{totalReviews}</strong>
        </div>

        <div className="admin-review-stat">
          <span>Platform average rating</span>
          <strong>{averageRating.toFixed(1)} / 5</strong>
          {renderStars(Math.round(averageRating))}
        </div>

        <div className="admin-review-stat">
          <span>Providers reviewed</span>
          <strong>{providers.length}</strong>
        </div>
      </section>

      <section className="admin-review-list-section">
        <div className="admin-review-list-heading">
          <div>
            <h2>All feedback</h2>
            <p>Newest reviews appear first.</p>
          </div>

          <div className="admin-review-filters">
            <select
              value={providerFilter}
              onChange={(event) => setProviderFilter(event.target.value)}
              aria-label="Filter by provider"
            >
              <option value="all">All providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              aria-label="Filter by rating"
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="admin-reviews-state">
            <MessageSquareText size={30} />
            <h3>No reviews found</h3>
            <p>Try changing your filters or check back when reviews arrive.</p>
          </div>
        ) : (
          <div className="admin-review-list">
            {filteredReviews.map((review) => (
              <article className="admin-review-card" key={review._id}>
                <div className="admin-review-avatar">
                  {(review.customer?.fullName || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="admin-review-content">
                  <div className="admin-review-top">
                    <div>
                      <h3>{review.customer?.fullName || "Customer"}</h3>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>

                    <div className="admin-review-rating">
                      {renderStars(review.rating)}
                      <strong>{review.rating}/5</strong>
                    </div>
                  </div>

                  <p className="admin-review-provider">
                    Provider: {review.provider?.fullName || "Unknown provider"}
                    {review.provider?.serviceCategory
                      ? ` · ${review.provider.serviceCategory}`
                      : ""}
                  </p>

                  <p className="admin-review-comment">
                    {review.comment?.trim() || "No written comment provided."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
