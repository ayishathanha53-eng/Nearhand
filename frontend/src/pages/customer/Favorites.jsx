
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Star, Trash2 } from "lucide-react";
import "./Favorites.css";

const API_URL = "http://localhost:5000";

export default function Favorites() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  async function loadFavorites() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your favourites.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/customer/favourites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load favourites.");
      }

      const list =
        result.favourites ??
        result.favorites ??
        result.providers ??
        [];

      setProviders(
        list
          .map((item) => item.provider ?? item)
          .filter((item) => item && (item._id || item.id))
      );
    } catch (err) {
      setError(err.message || "Unable to load favourites.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function removeFavorite(providerId) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRemovingId(providerId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/customer/favourites/${providerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to remove favourite.");
      }

      setProviders((current) =>
        current.filter(
          (provider) =>
            String(provider._id || provider.id) !== String(providerId)
        )
      );
    } catch (err) {
      setError(err.message || "Unable to remove favourite.");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        <button
          className="favorites-back-button"
          onClick={() => navigate("/customer/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <header className="favorites-header">
          <div className="favorites-heading-icon">
            <Heart size={25} />
          </div>

          <div>
            <h1>Favorite Providers</h1>
            <p>Your saved professionals, all in one place.</p>
          </div>
        </header>

        {error && (
          <div className="favorites-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="favorites-state">
            Loading your favourite providers...
          </div>
        ) : providers.length === 0 ? (
          <section className="favorites-empty">
            <Heart size={42} />
            <h2>No favourites yet</h2>
            <p>
              Save providers you like from Search Providers
              and they will appear here.
            </p>

            <button
              className="favorites-primary-button"
              onClick={() => navigate("/customer/search-providers")}
            >
              Find Providers
            </button>
          </section>
        ) : (
          <>
            <p className="favorites-count">
              {providers.length} saved{" "}
              {providers.length === 1 ? "provider" : "providers"}
            </p>

            <div className="favorites-grid">
              {providers.map((provider) => {
                const id = provider._id || provider.id;

                return (
                  <article className="favorite-provider-card" key={id}>
                    <div className="favorite-provider-avatar">
                      {provider.profilePhoto ? (
                        <img
                          src={
                            /^https?:\/\//i.test(provider.profilePhoto)
                              ? provider.profilePhoto
                              : `${API_URL}/${provider.profilePhoto.replace(/^\/+/, "")}`
                          }
                          alt={provider.fullName || "Provider"}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Heart size={28} />
                      )}
                    </div>

                    <div className="favorite-provider-content">
                      <h2>{provider.fullName || "Service Provider"}</h2>

                      <p className="favorite-provider-category">
                        {provider.serviceCategory || "Professional Services"}
                      </p>

                      {(provider.city || provider.district) && (
                        <p className="favorite-provider-location">
                          <MapPin size={15} />
                          {[provider.city, provider.district]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {provider.startingPrice != null && (
                        <p className="favorite-provider-price">
                          Starting at ₹
                          {Number(provider.startingPrice).toLocaleString("en-IN")}
                        </p>
                      )}

                      <div className="favorite-provider-actions">
                        <button
                          className="favorites-primary-button"
                          onClick={() =>
                            navigate(`/customer/provider/${id}`)
                          }
                        >
                          View Profile
                        </button>

                        <button
                          className="favorites-remove-button"
                          disabled={removingId === String(id)}
                          onClick={() => removeFavorite(id)}
                          aria-label={`Remove ${provider.fullName || "provider"} from favourites`}
                          title="Remove from favourites"
                        >
                          <Trash2 size={17} />
                          {removingId === String(id) ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
