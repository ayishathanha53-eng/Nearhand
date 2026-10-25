import { useEffect, useState } from "react";
import {
  Star,
  MessageCircle,
  LoaderCircle,
  RefreshCw,
  MessageSquareText,
} from "lucide-react";
import "./Reviews.css";

const API_URL = "http://localhost:5000";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to view your reviews.");
      }

      // Get the logged-in provider's dashboard data first.
      const dashboardResponse = await fetch(
        `${API_URL}/api/providers/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dashboardData = await dashboardResponse.json();

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message || "Unable to identify your provider account."
        );
      }

      const provider = dashboardData.provider;

      // Adjust this if your dashboard API uses a different ID field.
      const providerId = provider?._id || provider?.id;

      if (!providerId) {
        throw new Error(
          "Your provider ID was not returned by the dashboard API."
        );
      }

      // Fetch reviews belonging to this provider only.
      const reviewsResponse = await fetch(
        `${API_URL}/api/reviews/provider/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reviewsData = await reviewsResponse.json();

      if (!reviewsResponse.ok) {
        throw new Error(
          reviewsData.message || "Unable to load your reviews."
        );
      }

      setReviews(reviewsData.reviews || []);
      setAverageRating(Number(reviewsData.averageRating) || 0);
      setTotalReviews(Number(reviewsData.totalReviews) || 0);
    } catch (err) {
      setError(err.message || "Something went wrong while loading reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const value = Number(rating) || 0;

    return (
      <div
        className="review-stars"
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            fill={star <= value ? "currentColor" : "none"}
            className={star <= value ? "star-filled" : "star-empty"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="provider-reviews-page">
        <div className="reviews-state">
          <LoaderCircle size={32} className="reviews-spinner" />
          <p>Loading your reviews...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="provider-reviews-page">
        <div className="reviews-state reviews-error">
          <MessageCircle size={34} />
          <h2>Unable to load reviews</h2>
          <p>{error}</p>
          <button
            type="button"
            className="reviews-retry-button"
            onClick={loadReviews}
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="provider-reviews-page">
      <header className="reviews-page-heading">
        <div>
          <p className="reviews-eyebrow">CUSTOMER FEEDBACK</p>
          <h1>My Reviews</h1>
          <p className="reviews-subtitle">
            See what customers say about your services.
          </p>
        </div>

        <button
          type="button"
          className="reviews-refresh-button"
          onClick={loadReviews}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="reviews-summary">
        <div className="reviews-summary-icon">
          <Star size={25} fill="currentColor" />
        </div>

        <div className="reviews-average">
          <span className="reviews-label">Overall rating</span>
          <div className="reviews-rating-line">
            <strong>{averageRating.toFixed(1)}</strong>
            <span className="reviews-out-of">/ 5</span>
          </div>
          {renderStars(Math.round(averageRating))}
          <span className="reviews-count">
            Based on {totalReviews}{" "}
            {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="reviews-summary-divider" />

        <div className="reviews-total">
          <span className="reviews-label">Total reviews</span>
          <strong>{totalReviews}</strong>
          <span className="reviews-total-caption">
            Customer feedback received
          </span>
        </div>
      </section>

      <section className="reviews-list-section">
        <div className="reviews-list-heading">
          <div>
            <h2>Customer Reviews</h2>
            <p>Feedback from customers who reviewed your service.</p>
          </div>
          <span className="reviews-total-badge">{reviews.length} shown</span>
        </div>

        {reviews.length === 0 ? (
          <div className="reviews-empty">
            <div className="reviews-empty-icon">
              <MessageSquareText size={30} />
            </div>
            <h3>No reviews yet</h3>
            <p>
              When customers review your completed jobs, their ratings and
              comments will appear here.
            </p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => {
              const customerName =
                review.customer?.fullName || "Customer";

              return (
                <article className="review-card" key={review._id}>
                  <div className="review-avatar">
                    {customerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="review-content">
                    <div className="review-top-row">
                      <div>
                        <h3>{customerName}</h3>
                        <span className="review-date">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      <div className="review-rating">
                        {renderStars(review.rating)}
                        <span>{review.rating}/5</span>
                      </div>
                    </div>

                    <p className="review-comment">
                      {review.comment?.trim()
                        ? review.comment
                        : "The customer left a star rating without a written comment."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}