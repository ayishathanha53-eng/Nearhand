
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  MapPin,
  Star,
  BriefcaseBusiness,
  RefreshCw,
  UserRound,
} from "lucide-react";
import "./SearchProviders.css";

const API_URL = "http://localhost:5000";

export default function SearchProviders() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function fetchProviders(searchTerm = "", cityName = "") {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as a customer to search providers.");
      setProviders([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (cityName.trim()) params.set("city", cityName.trim());

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

  useEffect(() => {
    fetchProviders();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    fetchProviders(search, city);
  }

  function resetSearch() {
    setSearch("");
    setCity("");
    fetchProviders("", "");
  }

  return (
    <main className="customer-search-page">
      <button
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
            Discover approved professionals who are currently accepting bookings.
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
            placeholder="Try plumbing, electrician, repairs..."
            aria-label="Search services or skills"
          />
        </label>

        <label className="customer-search-input city-input">
          <MapPin size={19} />
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City"
            aria-label="Filter by city"
          />
        </label>

        <button
          type="submit"
          className="customer-search-button"
          disabled={loading}
        >
          <Search size={18} />
          Search
        </button>
      </form>

      <section className="customer-search-results">
        <div className="customer-search-results-heading">
          <div>
            <h2>Available professionals</h2>
            <p>
              {loading
                ? "Finding providers..."
                : `${providers.length} ${providers.length === 1 ? "provider" : "providers"} found`}
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
                className="customer-provider-card"
                key={provider._id || provider.id}
              >
                <div className="customer-provider-card-top">
                  <div className="customer-provider-avatar">
                    
                  {provider.profilePhoto ? (
                    <img
                      src={`http://localhost:5000/${provider.profilePhoto.replace(/\\/g, "/").replace(/^\/+/, "")}`}
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
                      .filter((value, index, values) => values.indexOf(value) === index)
                      .join(" · ")}
                  </p>
                )}

                {provider.serviceDescription && (
                  <p className="customer-provider-description">
                    {provider.serviceDescription}
                  </p>
                )}

                {Array.isArray(provider.skills) && provider.skills.length > 0 && (
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
                      ₹{Number(provider.startingPrice || 0).toLocaleString("en-IN")}
                    </strong>
                    <span>starting price</span>
                  </div>

                  <div className="customer-provider-radius">
                    {provider.serviceRadiusKm
                      ? `${provider.serviceRadiusKm} km radius`
                      : "Service provider"}
                  </div>
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
                ? "Try another service or city. Providers appear here only when their profiles are approved, completed, and live."
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
