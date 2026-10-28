
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

const STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const statusColors = {
  Pending: { color: "#92400e", background: "#fef3c7" },
  Confirmed: { color: "#1d4ed8", background: "#dbeafe" },
  "In Progress": { color: "#6d28d9", background: "#ede9fe" },
  Completed: { color: "#166534", background: "#dcfce7" },
  Cancelled: { color: "#b91c1c", background: "#fee2e2" },
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
}

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}


export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in to view your bookings.");
      }

      const response = await fetch(`${API_URL}/api/customer/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load bookings.");
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  return (
    <main style={styles.page}>
      
    <header style={styles.header}>
      <div>
        <Link
          to="/customer/dashboard"
          style={{
            display: "inline-block",
            marginBottom: 14,
            color: "#177d4b",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to Dashboard
        </Link>

        <h1 style={styles.title}>Booking History</h1>
        <p style={styles.subtitle}>
          Track your services and view previous bookings.
        </p>
      </div>

      <button
        type="button"
        onClick={loadBookings}
        disabled={loading}
        style={styles.refreshButton}
      >
        {loading ? "Refreshing..." : "↻ Refresh"}
      </button>
    </header>


      <nav style={styles.filters} aria-label="Filter bookings by status">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterButton,
              ...(filter === status ? styles.activeFilter : {}),
            }}
          >
            {status}
            {status === "All" ? ` (${bookings.length})` : ""}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
          <button
            type="button"
            onClick={loadBookings}
            style={styles.retryButton}
          >
            Try again
          </button>
          <p>
            <Link to="/customer/dashboard" style={styles.backLink}>
              ← Back to Dashboard
            </Link>
          </p>
        </div>
      )}

      {loading ? (
        <p style={styles.message}>Loading your bookings...</p>
      ) : !error && filteredBookings.length === 0 ? (
        <section style={styles.empty}>
          <h2>No bookings found</h2>
          <p>
            {filter === "All"
              ? "Your bookings will appear here after you book a service."
              : `You don't have any ${filter.toLowerCase()} bookings.`}
          </p>
        </section>
      ) : (
        <section style={styles.list}>
          {filteredBookings.map((booking) => {
            const provider = booking.provider;
            const statusStyle =
              statusColors[booking.status] || statusColors.Pending;

            return (
              <article key={booking._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.serviceName}>
                      {booking.serviceName || "Service booking"}
                    </h2>
                    <p style={styles.bookingId}>
                      Booking ID: {booking._id}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      color: statusStyle.color,
                      background: statusStyle.background,
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <div style={styles.detailsGrid}>
                  <div>
                    <span style={styles.label}>Appointment</span>
                    <p style={styles.value}>
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>

                  <div>
                    <span style={styles.label}>Service address</span>
                    <p style={styles.value}>
                      {booking.address || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span style={styles.label}>Provider</span>
                    <p style={styles.value}>
                      {provider?.fullName ||
                        provider?.name ||
                        provider?.businessName ||
                        "Provider"}
                    </p>
                  </div>

                 
                </div>

                <div style={styles.cardFooter}>
                  <strong style={styles.price}>
                    ₹{Number(booking.price || 0).toLocaleString("en-IN")}
                  </strong>

                  
                  <Link
                    to={`/customer/booking-details/${booking._id}`}
                    style={styles.detailsButton}
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "28px 22px",
    color: "#173b2a",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  title: { margin: 0, fontSize: 32, fontWeight: 750 },
  subtitle: { color: "#647568", marginTop: 8 },
  refreshButton: {
    padding: "10px 16px",
    border: "1px solid #cbded1",
    borderRadius: 10,
    background: "#fff",
    color: "#176b42",
    cursor: "pointer",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  filterButton: {
    border: "1px solid #d9e5dc",
    borderRadius: 22,
    background: "#fff",
    color: "#365344",
    padding: "9px 14px",
    cursor: "pointer",
  },
  activeFilter: {
    background: "#177d4b",
    color: "#fff",
    borderColor: "#177d4b",
  },
  list: { display: "grid", gap: 18 },
  card: {
    border: "1px solid #dce8df",
    borderRadius: 16,
    padding: 22,
    background: "#fff",
    boxShadow: "0 5px 20px rgba(20,60,40,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  serviceName: { margin: 0, fontSize: 21 },
  bookingId: {
    margin: "7px 0 0",
    fontSize: 12,
    color: "#718078",
    overflowWrap: "anywhere",
  },
  badge: {
    padding: "7px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 18,
  },
  label: { color: "#728077", fontSize: 13 },
  value: { margin: "6px 0 0", overflowWrap: "anywhere" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    borderTop: "1px solid #e6eee8",
    marginTop: 22,
    paddingTop: 18,
  },
  price: { fontSize: 23, color: "#177d4b" },
  detailsButton: {
    textDecoration: "none",
    background: "#177d4b",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 9,
    fontWeight: 600,
  },
  error: {
    background: "#fff1f1",
    color: "#b42318",
    padding: 16,
    borderRadius: 10,
  },
  retryButton: { marginLeft: 12, cursor: "pointer" },
  message: { padding: 24, color: "#647568" },
  empty: {
    padding: 40,
    textAlign: "center",
    border: "1px dashed #cbded1",
    borderRadius: 14,
  },
};
