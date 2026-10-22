
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

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

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

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in to view booking details.");
      }

      const response = await fetch(
        `${API_URL}/api/customer/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load booking details.");
      }

      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  if (loading) {
    return <main style={styles.page}>Loading booking details...</main>;
  }

  if (error || !booking) {
    return (
      <main style={styles.page}>
        <p role="alert" style={styles.error}>
          {error || "Booking not found."}
        </p>
        <button type="button" onClick={loadBooking} style={styles.button}>
          Try again
        </button>
        <p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link to="/customer/dashboard" style={styles.backLink}>
            ← Dashboard
          </Link>

          <Link to="/customer/booking-history" style={styles.backLink}>
            Booking History
          </Link>
          </div>
        </p>
      </main>
    );
  }

  const provider = booking.provider;
  const statusColor = statusColors[booking.status] || "#475569";

  return (
    <main style={styles.page}>
      <Link to="/customer/booking-history" style={styles.backLink}>
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
          style={styles.button}
        >
          ↻ Refresh
        </button>
      </header>

      <section style={styles.card}>
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
            {booking.status}
          </span>
        </div>

        <div style={styles.progress}>
          {["Pending", "Confirmed", "In Progress", "Completed"].map(
            (status, index) => {
              const stages = ["Pending", "Confirmed", "In Progress", "Completed"];
              const currentIndex = stages.indexOf(booking.status);
              const isDone =
                booking.status !== "Cancelled" &&
                currentIndex >= index;

              return (
                <div key={status} style={styles.stage}>
                  <span
                    style={{
                      ...styles.stageCircle,
                      background: isDone ? "#177d4b" : "#e2e8e4",
                      color: isDone ? "#fff" : "#647568",
                    }}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>
                  <span style={styles.stageLabel}>{status}</span>
                </div>
              );
            }
          )}
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

        <div style={styles.section}>
          <h3>Appointment information</h3>
          <Info label="Service" value={booking.serviceName} />
          <Info label="Appointment date" value={formatDate(booking.bookingDate)} />
          <Info label="Service address" value={booking.address} />
          <Info
            label="Customer description"
            value={booking.description || "No additional details"}
          />
        </div>

        <div style={styles.section}>
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
            <Info label="Provider phone" value={provider.phone} />
          )}
        </div>

        <div style={styles.section}>
          <h3>Payment information</h3>
          <Info
            label="Service price"
            value={`₹${Number(booking.price || 0).toLocaleString("en-IN")}`}
          />
          <Info
            label="Payment status"
            value={booking.paymentStatus || "Pending"}
          />
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || "Not available"}</span>
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
  title: { margin: 0, fontSize: 32 },
  muted: { color: "#647568", overflowWrap: "anywhere" },
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
  serviceName: { margin: 0, fontSize: 24 },
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
  stageLabel: { fontSize: 12, color: "#53665a" },
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
  infoLabel: { color: "#647568", flex: "0 0 40%" },
  infoValue: { fontWeight: 500, textAlign: "right", overflowWrap: "anywhere" },
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
  error: { color: "#b42318" },
};
