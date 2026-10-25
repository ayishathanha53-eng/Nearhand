
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000";

const statusColors = {
  Pending: "#a16207",
  Confirmed: "#2563eb",
  "In Progress": "#7c3aed",
  Completed: "#15803d",
  Cancelled: "#dc2626",
};

const bookingStages = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BookingDetails() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewChecked, setReviewChecked] = useState(false);

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please log in to view booking details."
        );
      }

      const response = await fetch(
        `${API_URL}/api/customer/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load booking details."
        );
      }

      if (!data.booking) {
        throw new Error("Booking details were not found.");
      }

      setBooking(data.booking);
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading the booking."
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);



useEffect(() => {
  let cancelled = false;

  async function checkReviewStatus() {
    setReviewChecked(false);
    setReviewSubmitted(false);
    setReviewSuccess("");

    const token = getToken();

    if (!token || !bookingId) {
      if (!cancelled) {
        setReviewChecked(true);
      }
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/reviews/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Unable to check review status."
        );
      }

      if (!cancelled) {
        setReviewSubmitted(data.reviewed === true);

        if (data.reviewed) {
          setReviewSuccess(
            "You have already reviewed this service."
          );
        }
      }
    } catch (err) {
      if (!cancelled) {
        // Keep the review form available if the status check fails.
        // The backend must still prevent duplicate reviews.
        console.error("Review status error:", err);
      }
    } finally {
      if (!cancelled) {
        setReviewChecked(true);
      }
    }
  }

  checkReviewStatus();

  return () => {
    cancelled = true;
  };
}, [bookingId]);






  const submitReview = async (event) => {
    event.preventDefault();

    if (reviewLoading || reviewSubmitted) return;

    setReviewError("");
    setReviewSuccess("");

    if (booking?.status !== "Completed") {
      setReviewError(
        "You can only review a completed booking."
      );
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setReviewError(
        "Please log in to submit your review."
      );
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          rating,
          comment: comment.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to submit your review."
        );
      }

      setReviewSubmitted(true);
      setReviewSuccess(
        result.message || "Your review was submitted successfully."
      );
      setReviewError("");
    } catch (err) {
      setReviewError(
        err.message || "Unable to submit your review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.page} aria-live="polite">
        Loading booking details...
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main style={styles.page}>
        <p role="alert" style={styles.error}>
          {error || "Booking not found."}
        </p>

        <button
          type="button"
          onClick={loadBooking}
          style={styles.button}
        >
          Try again
        </button>

        <div style={styles.navigation}>
          <Link to="/customer/dashboard" style={styles.backLink}>
            ← Dashboard
          </Link>

          <Link
            to="/customer/booking-history"
            style={styles.backLink}
          >
            Booking History
          </Link>
        </div>
      </main>
    );
  }

  const provider = booking.provider;
  const statusColor =
    statusColors[booking.status] || "#475569";

  const currentStageIndex = bookingStages.indexOf(
    booking.status
  );

  return (
    <main style={styles.page}>
      <Link
        to="/customer/booking-history"
        style={styles.backLink}
      >
        ← Back to Booking History
      </Link>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Booking Details</h1>
          <p style={styles.muted}>
            Review your service booking and its current progress.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBooking}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
        >
          ↻ Refresh
        </button>
      </header>

      <section style={styles.card}>
        {/* Booking summary */}
        <div style={styles.topRow}>
          <div>
            <h2 style={styles.serviceName}>
              {booking.serviceName || "Service booking"}
            </h2>

            <p style={styles.muted}>
              Booking ID: {booking._id}
            </p>
          </div>

          <span
            style={{
              ...styles.status,
              color: statusColor,
              borderColor: statusColor,
            }}
          >
            {booking.status || "Unknown"}
          </span>
        </div>

        {/* Booking progress */}
        <div
          style={styles.progress}
          aria-label="Booking progress"
        >
          {bookingStages.map((stage, index) => {
            const isDone =
              booking.status !== "Cancelled" &&
              currentStageIndex >= index;

            return (
              <div key={stage} style={styles.stage}>
                <span
                  style={{
                    ...styles.stageCircle,
                    background: isDone
                      ? "#177d4b"
                      : "#e2e8e4",
                    color: isDone ? "#fff" : "#647568",
                  }}
                >
                  {isDone ? "✓" : index + 1}
                </span>

                <span style={styles.stageLabel}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        {booking.status === "Cancelled" && (
          <p style={styles.cancelled}>
            This booking has been cancelled.
          </p>
        )}

        {booking.status === "Completed" && (
          <p style={styles.completed}>
            Your service has been completed successfully.
          </p>
        )}

        {/* Review section */}
        {booking.status === "Completed" && (
          <section
            style={styles.reviewSection}
            aria-labelledby="review-heading"
          >
            <h3
              id="review-heading"
              style={styles.reviewHeading}
            >
              Review this service
            </h3>

            {!reviewChecked ? (
              <p style={styles.muted} role="status">
                Checking review status...
              </p>
            ) : reviewSubmitted ? (
              <p style={styles.reviewSuccess} role="status">
                {reviewSuccess || "You have already reviewed this service."}
              </p>
            ) : (
              <form onSubmit={submitReview}>
                <label style={styles.reviewLabel}>
                  Your rating
                </label>

                <div
                  style={styles.reviewStars}
                  role="group"
                  aria-label="Choose a rating from 1 to 5"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${
                        value === 1 ? "" : "s"
                      }`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(value)}
                      disabled={reviewLoading}
                      style={{
                        ...styles.starButton,
                        color:
                          value <= rating
                            ? "#eab308"
                            : "#cbd5e1",
                        cursor: reviewLoading
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      ★
                    </button>
                  ))}

                  <span style={styles.ratingText}>
                    {rating} / 5
                  </span>
                </div>

                <label
                  htmlFor="review-comment"
                  style={styles.reviewLabel}
                >
                  Your comments (optional)
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value.slice(0, 1000)
                    )
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell others about your experience..."
                  disabled={reviewLoading}
                  style={styles.reviewTextarea}
                />

                <p style={styles.reviewCounter}>
                  {comment.length}/1000 characters
                </p>

                {reviewError && (
                  <p role="alert" style={styles.reviewError}>
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  style={{
                    ...styles.reviewSubmitButton,
                    opacity: reviewLoading ? 0.65 : 1,
                    cursor: reviewLoading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {reviewLoading
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Appointment information */}
        <section style={styles.section}>
          <h3>Appointment information</h3>

          <Info
            label="Service"
            value={booking.serviceName}
          />

          <Info
            label="Appointment date"
            value={formatDate(booking.bookingDate)}
          />

          <Info
            label="Service address"
            value={booking.address}
          />

          <Info
            label="Customer description"
            value={
              booking.description ||
              "No additional details"
            }
          />
        </section>

        {/* Provider information */}
        <section style={styles.section}>
          <h3>Provider information</h3>

          <Info
            label="Provider name"
            value={
              provider?.fullName ||
              provider?.name ||
              provider?.businessName ||
              "Provider details unavailable"
            }
          />

          {provider?.phone && (
            <Info
              label="Provider phone"
              value={provider.phone}
            />
          )}
        </section>

        {/* Payment information */}
        <section style={styles.section}>
          <h3>Payment information</h3>

          <Info
            label="Service Fixed price"
            value={`₹${Number(
              booking.price || 0
            ).toLocaleString("en-IN")}`}
          />

          
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>
        {value || "Not available"}
      </span>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "28px 22px",
    color: "#173b2a",
    fontFamily: "inherit",
  },

  navigation: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 18,
  },

  backLink: {
    color: "#177d4b",
    textDecoration: "none",
    fontWeight: 600,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    margin: "20px 0",
  },

  title: {
    margin: 0,
    fontSize: 32,
  },

  muted: {
    color: "#647568",
    overflowWrap: "anywhere",
  },

  button: {
    border: "1px solid #cbded1",
    borderRadius: 9,
    padding: "10px 15px",
    background: "#fff",
    color: "#176b42",
    cursor: "pointer",
  },

  card: {
    background: "#fff",
    border: "1px solid #dce8df",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 5px 20px rgba(20,60,40,0.04)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
  },

  serviceName: {
    margin: 0,
    fontSize: 24,
  },

  status: {
    border: "1px solid",
    borderRadius: 20,
    padding: "7px 13px",
    fontWeight: 700,
  },

  progress: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
    margin: "30px 0",
  },

  stage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    textAlign: "center",
  },

  stageCircle: {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    fontWeight: 700,
  },

  stageLabel: {
    fontSize: 12,
    color: "#53665a",
  },

  section: {
    borderTop: "1px solid #e2ebe5",
    paddingTop: 18,
    marginTop: 22,
  },

  info: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    padding: "11px 0",
    borderBottom: "1px solid #f0f3f0",
  },

  infoLabel: {
    color: "#647568",
    flex: "0 0 40%",
  },

  infoValue: {
    fontWeight: 500,
    textAlign: "right",
    overflowWrap: "anywhere",
  },

  completed: {
    padding: 13,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 9,
  },

  cancelled: {
    padding: 13,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 9,
  },

  error: {
    color: "#b42318",
  },

  reviewSection: {
    border: "1px solid #dce8df",
    borderRadius: 12,
    padding: 20,
    marginTop: 22,
    background: "#fafffb",
  },

  reviewHeading: {
    marginTop: 0,
  },

  reviewLabel: {
    display: "block",
    fontWeight: 600,
    margin: "14px 0 8px",
  },

  reviewStars: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  starButton: {
    border: "none",
    background: "transparent",
    fontSize: 32,
    padding: 0,
    lineHeight: 1.2,
  },

  ratingText: {
    fontSize: 14,
    color: "#647568",
    marginLeft: 8,
  },

  reviewTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #cbded1",
    borderRadius: 9,
    font: "inherit",
    resize: "vertical",
  },

  reviewCounter: {
    textAlign: "right",
    fontSize: 12,
    color: "#647568",
    marginTop: 5,
  },

  reviewSubmitButton: {
    marginTop: 12,
    padding: "11px 18px",
    border: "none",
    borderRadius: 9,
    background: "#177d4b",
    color: "#fff",
    fontWeight: 600,
  },

  reviewSuccess: {
    padding: 12,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 9,
  },

  reviewError: {
    color: "#b42318",
    marginTop: 10,
  },
};
