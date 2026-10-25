
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  RefreshCw,
  UserRound,
  Heart,
  Star,
} from "lucide-react";
import "./SearchProviders.css";

const API_URL = "http://localhost:5000";

export default function SearchProviders() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState({});


  async function fetchProviders(searchTerm = "", pin = "") {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as a customer to search providers.");
      setProviders([]);
      return;
    }

    const cleanPin = pin.trim();

    if (cleanPin && !/^\d{6}$/.test(cleanPin)) {
      setError("Please enter a valid six-digit PIN code.");
      setProviders([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      if (cleanPin) {
        params.set("pincode", cleanPin);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/api/customer/providers${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load providers.");
      }

      setProviders(Array.isArray(data.providers) ? data.providers : []);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }
async function fetchFavorites() {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const response = await fetch(
      `${API_URL}/api/customer/favourites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load favourites.");
    }

    const ids = (data.favourites || [])
      .map((item) => item.provider?._id)
      .filter(Boolean);

    setFavoriteIds(new Set(ids));
  } catch (error) {
    console.error("Fetch favourites error:", error);
  }
}

async function toggleFavorite(event, provider) {
  event.stopPropagation();

  const providerId = provider._id || provider.id;

  if (!providerId || favoriteLoading[providerId]) return;

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  const isFavorite = favoriteIds.has(providerId);

  setFavoriteLoading((prev) => ({
    ...prev,
    [providerId]: true,
  }));

  try {
    const response = await fetch(
      `${API_URL}/api/customer/favourites/${providerId}`,
      {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to update favourite.");
    }

    setFavoriteIds((prev) => {
      const next = new Set(prev);

      if (isFavorite) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }

      return next;
    });
  } catch (error) {
    setError(error.message || "Unable to update favourite.");
  } finally {
    setFavoriteLoading((prev) => ({
      ...prev,
      [providerId]: false,
    }));
  }
}


useEffect(() => {
  fetchProviders();
  fetchFavorites();
}, []);

  function handleSearch(event) {
    event.preventDefault();
    fetchProviders(search, pincode);
  }

  function resetSearch() {
    setSearch("");
    setPincode("");
    fetchProviders("", "");
  }

  function openProvider(provider) {
    const providerId = provider._id || provider.id;

    if (!providerId) {
      setError("Unable to open this provider's profile.");
      return;
    }

    navigate(`/customer/provider/${providerId}`);
  }

  function getPhotoUrl(photo) {
    if (!photo) return "";

    const normalizedPath = photo.replace(/\\/g, "/").replace(/^\/+/, "");

    if (/^https?:\/\//i.test(normalizedPath)) {
      return normalizedPath;
    }

    return `${API_URL}/${normalizedPath}`;
  }

  return (
    <main className="customer-search-page">
      <button
        type="button"
        className="customer-search-back"
        onClick={() => navigate("/customer/dashboard")}
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <header className="customer-search-heading">
        <div>
          <p className="customer-search-eyebrow">NEARHAND SERVICES</p>
          <h1>Find your service provider</h1>
          <p>
            Search by PIN code and discover approved professionals accepting
            bookings in your area.
          </p>
        </div>

        <div className="customer-search-heading-icon">
          <BriefcaseBusiness size={28} />
        </div>
      </header>

      <form className="customer-search-form" onSubmit={handleSearch}>
        <label className="customer-search-input">
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Service, e.g. plumbing or repairs"
            aria-label="Search services or skills"
          />
        </label>

        <label className="customer-search-input city-input">
          <MapPin size={19} />
          <input
            value={pincode}
            onChange={(event) =>
              setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="6-digit PIN code"
            aria-label="Search by PIN code"
            inputMode="numeric"
            maxLength={6}
          />
        </label>

        <button
          type="submit"
          className="customer-search-button"
          disabled={loading}
        >
          <Search size={18} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <section className="customer-search-results">
        <div className="customer-search-results-heading">
          <div>
            <h2>Available professionals</h2>
            <p>
              {loading
                ? "Finding providers..."
                : `${providers.length} ${
                    providers.length === 1 ? "provider" : "providers"
                  } found`}
            </p>
          </div>

          <button
            type="button"
            className="customer-search-reset"
            onClick={resetSearch}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Clear filters
          </button>
        </div>

        {error && (
          <div className="customer-search-message error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="customer-search-message">
            <span className="customer-search-spinner" />
            Loading available providers...
          </div>
        )}

        {!loading && !error && providers.length > 0 && (
          <div className="customer-provider-grid">
            {providers.map((provider) => (
              <article
                className="customer-provider-card customer-provider-card-clickable"
                key={provider._id || provider.id}
                onClick={() => openProvider(provider)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProvider(provider);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${provider.fullName || "provider"} profile`}
              >
                <div className="customer-provider-card-top">
                  <button
                    type="button"
                    className={`provider-favorite-btn ${
                      favoriteIds.has(provider._id || provider.id)
                        ? "is-favorite"
                        : ""
                    }`}
                    onClick={(event) => toggleFavorite(event, provider)}
                    disabled={!!favoriteLoading[provider._id || provider.id]}
                    aria-label={
                      favoriteIds.has(provider._id || provider.id)
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                    title={
                      favoriteIds.has(provider._id || provider.id)
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                  >
                    <Heart
                      size={20}
                      fill={
                        favoriteIds.has(provider._id || provider.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                  <div className="customer-provider-avatar">
                    {provider.profilePhoto ? (
                      <img
                        src={getPhotoUrl(provider.profilePhoto)}
                        alt={provider.fullName || "Service provider"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <UserRound size={30} />
                    )}
                  </div>

                  <span className="customer-provider-live">
                    <span />
                    Available
                  </span>
                </div>

                <h3>{provider.fullName || "Service Professional"}</h3>

                <p className="customer-provider-category">
                  {provider.serviceCategory || "General services"}
                </p>

                {(provider.city || provider.serviceArea) && (
                  <p className="customer-provider-location">
                    <MapPin size={15} />
                    {[provider.city, provider.serviceArea]
                      .filter(Boolean)
                      .filter(
                        (value, index, values) =>
                          values.indexOf(value) === index
                      )
                      .join(" · ")}
                  </p>
                )}

                {provider.serviceDescription && (
                  <p className="customer-provider-description">
                    {provider.serviceDescription}
                  </p>
                )}

                {Array.isArray(provider.skills) &&
                  provider.skills.length > 0 && (
                    <div className="customer-provider-skills">
                      {provider.skills.slice(0, 4).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}

                      {provider.skills.length > 4 && (
                        <span>+{provider.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                <div className="customer-provider-card-footer">
                  <div className="customer-provider-price">
                    <strong>
                      ₹
                      {Number(provider.startingPrice || 0).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                    <span>starting price</span>
                  </div>

                  <div className="customer-provider-radius">
                    {provider.serviceRadiusKm
                      ? `${provider.serviceRadiusKm} km radius`
                      : "Service provider"}
                  </div>
                </div>

                <div className="customer-provider-view-profile">
                  View profile &amp; working hours →
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && providers.length === 0 && (
          <div className="customer-search-empty">
            <div className="customer-search-empty-icon">
              <Search size={28} />
            </div>

            <h3>
              {searched
                ? "No available providers found"
                : "Find your next service"}
            </h3>

            <p>
              {searched
                ? "Try another PIN code or service. Only approved providers with completed profiles who are accepting bookings appear here."
                : "Search for a service to discover available professionals."}
            </p>

            {searched && (
              <button
                type="button"
                className="customer-search-button"
                onClick={resetSearch}
              >
                Show all providers
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
