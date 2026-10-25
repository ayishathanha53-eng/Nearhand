import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  UserRound,
  BriefcaseBusiness,
  Clock,
  CalendarDays,
  IndianRupee,
  Languages,
  Heart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Timer,
  Navigation,
  Star
} from "lucide-react";
import "./ProviderPublicProfile.css";

const API_URL = "http://localhost:5000";

export default function ProviderPublicProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [favouriteError, setFavouriteError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setPhotoFailed(false);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view this provider.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/providers/public/${providerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load provider profile."
          );
        }

        if (!cancelled) {
          setProvider(data.provider);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load provider profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  function getPhotoUrl(photo) {
    if (!photo) return "";

    const normalizedPath = photo
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    if (/^https?:\/\//i.test(normalizedPath)) {
      return normalizedPath;
    }

    return `${API_URL}/${normalizedPath}`;
  }

  function formatTime(time) {
    if (!time) return "";

    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time;

    const hours = Number(match[1]);
    const minutes = match[2];
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  function bookService() {
    if (!provider) return;

    navigate(
      `/customer/book-service?providerId=${provider._id || provider.id}`
    );
  }

  if (loading) {
    return (
      <main className="provider-profile-page">
        <div className="profile-state-card">
          <div className="profile-loading-spinner" />
          <h2>Loading provider profile</h2>
          <p>Please wait while we fetch the provider details.</p>
        </div>
      </main>
    );
  }

  if (error || !provider) {
    return (
      <main className="provider-profile-page">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/customer/search-providers")}
        >
          <ArrowLeft size={18} />
          Back to providers
        </button>

        <div className="profile-state-card profile-error-card">
          <div className="profile-state-icon">
            <UserRound size={28} />
          </div>
          <h2>Profile unavailable</h2>
          <p>{error || "Provider profile not found."}</p>
          <button
            type="button"
            className="profile-primary-button"
            onClick={() => navigate("/customer/search-providers")}
          >
            Find other providers
          </button>
        </div>
      </main>
    );
  }

  const workingDays = Array.isArray(provider.workingHours)
    ? provider.workingHours
    : [];

  const location = [
    provider.serviceArea,
    provider.city,
    provider.district,
    provider.state,
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");

  const skills = Array.isArray(provider.skills) ? provider.skills : [];
  const languages = Array.isArray(provider.languages)
    ? provider.languages
    : [];
  const servicePincodes = Array.isArray(provider.servicePincodes)
    ? provider.servicePincodes
    : [];

  const description =
    provider.serviceDescription ||
    provider.about ||
    "This provider has not added a service description yet.";

  const photoUrl = getPhotoUrl(provider.profilePhoto);




async function loadReviews() {
  if (!providerId) return;

  setReviewsLoading(true);
  setReviewError("");

  try {
    const response = await fetch(
      `${API_URL}/api/reviews/provider/${providerId}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load reviews.");
    }

    setReviews(result.reviews || []);
    setAverageRating(Number(result.averageRating) || 0);
    setTotalReviews(Number(result.totalReviews) || 0);
  } catch (error) {
    setReviewError(error.message || "Unable to load reviews.");
  } finally {
    setReviewsLoading(false);
  }
}

useEffect(() => {
  loadReviews();
}, [providerId]);

async function loadFavouriteStatus() {
  const token = localStorage.getItem("token");

  if (!token || !providerId) return;

  try {
    const response = await fetch(
      `${API_URL}/api/customer/favourites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) return;

    // Supports common response property names.
    const savedProviders =
      result.favourites ??
      result.favorites ??
      result.providers ??
      [];

    setIsFavourite(
      savedProviders.some((item) => {
        const id =
          typeof item === "string"
            ? item
            : item.provider?._id ??
              item.provider?.id ??
              item._id ??
              item.id;

        return String(id) === String(providerId);
      })
    );
  } catch (error) {
    console.error("Load favourites error:", error);
  }
}

async function toggleFavourite() {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  setFavouriteLoading(true);
  setFavouriteError("");

  try {
    const method = isFavourite ? "DELETE" : "POST";

    const response = await fetch(
      `${API_URL}/api/customer/favourites/${providerId}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to update favourites.");
    }

    setIsFavourite(!isFavourite);
  } catch (error) {
    setFavouriteError(error.message || "Unable to update favourites.");
  } finally {
    setFavouriteLoading(false);
  }
}


useEffect(() => {
  loadFavouriteStatus();
}, [providerId]);













  return (
    <main className="provider-profile-page">
      <div className="provider-profile-container">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/customer/search-providers")}
        >
          <ArrowLeft size={18} />
          <span>Back to providers</span>
        </button>

        {/* Main provider identity card */}
        <section className="provider-hero-card">
          <div className="provider-hero-top">
            <div className="provider-avatar-wrap">
              {photoUrl && !photoFailed ? (
                <img
                  className="provider-avatar-image"
                  src={photoUrl}
                  alt={provider.fullName || "Provider"}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <div className="provider-avatar-placeholder">
                  <UserRound size={48} strokeWidth={1.5} />
                </div>
              )}

              <span className="provider-avatar-check" title="Provider profile">
                <CheckCircle2 size={19} />
              </span>
            </div>

            <div className="provider-hero-content">
              <div className="provider-status-row">
                <span className="provider-status-pill">
                  <span className="provider-status-dot" />
                  Accepting bookings
                </span>
                <span className="provider-profile-label">
                  <ShieldCheck size={15} />
                  Provider profile
                </span>
              </div>

              <h1>{provider.fullName || "Service Provider"}</h1>

              <p className="provider-hero-category">
                {provider.serviceCategory || "Professional Services"}
              </p>

              {location && (
                <p className="provider-hero-location">
                  <MapPin size={17} />
                  <span>{location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="provider-hero-divider" />

          <div className="provider-hero-facts">
            <div className="provider-hero-fact">
              <span className="provider-fact-icon">
                <IndianRupee size={19} />
              </span>
              <div>
                <span className="provider-fact-label">Starting price</span>
                <strong>
                  ₹{Number(provider.startingPrice || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="provider-hero-fact">
              <span className="provider-fact-icon">
                <BriefcaseBusiness size={19} />
              </span>
              <div>
                <span className="provider-fact-label">Experience</span>
                <strong>
                  {provider.experience != null
                    ? `${provider.experience} ${
                        Number(provider.experience) === 1 ? "year" : "years"
                      }`
                    : "Not specified"}
                </strong>
              </div>
            </div>

            <div className="provider-hero-fact">
              <span className="provider-fact-icon">
                <Navigation size={19} />
              </span>
              <div>
                <span className="provider-fact-label">Service radius</span>
                <strong>
                  {provider.serviceRadiusKm != null
                    ? `${provider.serviceRadiusKm} km`
                    : "Not specified"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Page content and booking panel */}
        <div className="provider-profile-layout">
          <div className="provider-profile-main">
            {/* About */}
            <section className="provider-info-card">
              <div className="provider-section-heading">
                <span className="provider-section-icon">
                  <BriefcaseBusiness size={20} />
                </span>
                <div>
                  <h2>About this provider</h2>
                  <p>Get to know your service professional</p>
                </div>
              </div>

              <p className="provider-description">{description}</p>

              {skills.length > 0 && (
                <div className="provider-skills-block">
                  <h3>Skills and services</h3>
                  <div className="provider-skills-list">
                    {skills.map((skill, index) => (
                      <span className="provider-skill-chip" key={`${skill}-${index}`}>
                        <CheckCircle2 size={14} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div className="provider-inline-detail">
                  <Languages size={18} />
                  <div>
                    <span className="provider-detail-label">Languages</span>
                    <p>{languages.join(", ")}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Working hours */}
            <section className="provider-info-card">
              <div className="provider-section-heading">
                <span className="provider-section-icon">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <h2>Working hours</h2>
                  <p>Check the provider's usual schedule</p>
                </div>
              </div>

              {workingDays.length === 0 ? (
                <div className="provider-empty-note">
                  Working hours have not been provided yet.
                </div>
              ) : (
                <div className="provider-hours-list">
                  {workingDays.map((day, index) => (
                    <div
                      className={`provider-hours-row ${
                        day.isWorking ? "" : "provider-hours-closed"
                      }`}
                      key={day.day || index}
                    >
                      <span className="provider-hours-day">
                        {day.day || "Day"}
                      </span>

                      <div className="provider-hours-time">
                        {day.isWorking ? (
                          <>
                            <Clock size={15} />
                            <span>
                              {formatTime(day.startTime)} –{" "}
                              {formatTime(day.endTime)}
                            </span>
                          </>
                        ) : (
                          <span className="provider-closed-label">Closed</span>
                        )}
                      </div>

                      {day.isWorking && day.breakStart && day.breakEnd && (
                        <span className="provider-hours-break">
                          Break: {formatTime(day.breakStart)} –{" "}
                          {formatTime(day.breakEnd)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Service details */}
            <section className="provider-info-card">
              <div className="provider-section-heading">
                <span className="provider-section-icon">
                  <Navigation size={20} />
                </span>
                <div>
                  <h2>Service details</h2>
                  <p>More information about service availability</p>
                </div>
              </div>

              <div className="provider-details-grid">
                <div className="provider-detail-tile">
                  <span className="provider-detail-tile-icon">
                    <IndianRupee size={17} />
                  </span>
                  <span className="provider-detail-label">Starting price</span>
                  <strong>
                    ₹{Number(provider.startingPrice || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="provider-detail-tile">
                  <span className="provider-detail-tile-icon">
                    <Navigation size={17} />
                  </span>
                  <span className="provider-detail-label">Service radius</span>
                  <strong>
                    {provider.serviceRadiusKm != null
                      ? `${provider.serviceRadiusKm} km`
                      : "Not specified"}
                  </strong>
                </div>

                <div className="provider-detail-tile">
                  <span className="provider-detail-tile-icon">
                    <Timer size={17} />
                  </span>
                  <span className="provider-detail-label">Appointment</span>
                  <strong>
                    {provider.appointmentDuration != null
                      ? `${provider.appointmentDuration} minutes`
                      : "Not specified"}
                  </strong>
                </div>

                <div className="provider-detail-tile">
                  <span className="provider-detail-tile-icon">
                    <Clock size={17} />
                  </span>
                  <span className="provider-detail-label">Booking notice</span>
                  <strong>
                    {provider.minimumBookingNoticeHours != null
                      ? `${provider.minimumBookingNoticeHours} hours`
                      : "Not specified"}
                  </strong>
                </div>
              </div>

              {(provider.pincode || servicePincodes.length > 0) && (
                <div className="provider-pincode-block">
                  <h3>Service PIN codes</h3>

                  {provider.pincode && (
                    <p>
                      Registered PIN code: <strong>{provider.pincode}</strong>
                    </p>
                  )}

                  {servicePincodes.length > 0 && (
                    <div className="provider-pincode-list">
                      {servicePincodes.map((pincode, index) => (
                        <span key={`${pincode}-${index}`}>{pincode}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>


            <section
              className="provider-info-card"
              id="provider-reviews"
            >
              <div className="provider-section-heading">
                <span className="provider-section-icon">
                  <Star size={20} />
                </span>

                <div>
                  <h2>Customer Reviews</h2>
                  <p>Feedback from customers who booked this provider</p>
                </div>
              </div>

              <div className="provider-review-summary">
                <strong>
                  {averageRating.toFixed(1)}
                </strong>

                <div>
                  <div className="provider-review-stars" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </div>

                  <p>
                    {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {reviewsLoading ? (
                <p>Loading customer reviews...</p>
              ) : reviewError ? (
                <p role="alert">{reviewError}</p>
              ) : reviews.length === 0 ? (
                <div className="provider-empty-note">
                  <MessageCircle size={24} />
                  <p>No reviews yet. Be the first customer to share feedback after completing a booking.</p>
                </div>
              ) : (
                <div className="provider-reviews-list">
                  {reviews.map((review) => (
                    <article
                      className="provider-review-item"
                      key={review._id}
                    >
                      <div className="provider-review-top">
                        <strong>
                          {review.customer?.fullName || "Customer"}
                        </strong>

                        <span className="provider-review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>

                      <p className="provider-review-date">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>

                      {review.comment && (
                        <p className="provider-review-comment">
                          {review.comment}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right-side action panel */}
          <aside className="provider-profile-sidebar">
            <section className="provider-booking-card">
              <span className="provider-booking-eyebrow">
                <CheckCircle2 size={15} />
                Ready to get started?
              </span>

              <h2>Book this provider</h2>
              <p>
                Review the service details and continue to choose your booking
                preferences.
              </p>

              <div className="provider-booking-price">
                <span>Starting from</span>
                <strong>
                  ₹{Number(provider.startingPrice || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                type="button"
                className="provider-book-button"
                onClick={bookService}
              >
                <CalendarDays size={19} />
                Book Service
              </button>

              <div className="provider-booking-note">
                <ShieldCheck size={17} />
                <span>Review the booking details before confirming.</span>
              </div>
            </section>

            <section className="provider-connect-card">
              <h3>Keep this provider handy</h3>
              <p>Save the provider or check customer feedback.</p>

              <button
                type="button"
                className="provider-secondary-action provider-favourite-action"
                onClick={toggleFavourite}
                disabled={favouriteLoading}
              >
                <Heart
                  size={19}
                  fill={isFavourite ? "currentColor" : "none"}
                />
                <span>
                  {favouriteLoading
                    ? "Updating..."
                    : isFavourite
                    ? "Remove from Favourites"
                    : "Add to Favourites"}
                </span>
              </button>

              {favouriteError && (
                <p role="alert">{favouriteError}</p>
              )}

              <button
                type="button"
                className="provider-secondary-action"
                onClick={() =>
                  document.getElementById("provider-reviews")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                <MessageCircle size={19} />
                <span>
                  Customer Reviews ({totalReviews})
                </span>
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}