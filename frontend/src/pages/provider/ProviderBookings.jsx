
import React, { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  UserRound,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ClipboardCheck,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const STATUS_STYLES = {
  Pending: { background: "#fff7ed", color: "#c2410c" },
  Confirmed: { background: "#eff6ff", color: "#1d4ed8" },
  "In Progress": { background: "#f5f3ff", color: "#6d28d9" },
  Completed: { background: "#ecfdf5", color: "#047857" },
  Cancelled: { background: "#fef2f2", color: "#b91c1c" },
};

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getCustomerName(customer) {
  if (!customer) return "Customer";
  return customer.fullName || customer.name || customer.email || "Customer";
}

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in to view provider bookings.");
      }

      const response = await fetch(`${API_URL}/api/providers/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateStatus = async (bookingId, status) => {
    const labels = {
      Confirmed: "accept this booking",
      Cancelled: "reject/cancel this booking",
      "In Progress": "start this service",
      Completed: "mark this service as completed",
    };

    if (!window.confirm(`Are you sure you want to ${labels[status]}?`)) {
      return;
    }

    setUpdatingId(bookingId);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/providers/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update booking.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? data.booking : booking
        )
      );

      setNotice(data.message || "Booking updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update booking.");
    } finally {
      setUpdatingId("");
    }
  };

  
    const renderActions = (booking) => {
    const busy = updatingId === booking._id;

    const actionsByStatus = {
        Pending: [
        {
            label: "Accept Booking",
            status: "Confirmed",
            icon: <CheckCircle2 size={17} />,
            className: "accept",
        },
        {
            label: "Reject Booking",
            status: "Cancelled",
            icon: <XCircle size={17} />,
            className: "reject",
        },
        ],

        Confirmed: [
        {
            label: "Start Service",
            status: "In Progress",
            icon: <PlayCircle size={17} />,
            className: "accept",
        },
        {
            label: "Cancel Booking",
            status: "Cancelled",
            icon: <XCircle size={17} />,
            className: "reject",
        },
        ],

        "In Progress": [
        {
            label: "Complete Service",
            status: "Completed",
            icon: <ClipboardCheck size={17} />,
            className: "accept",
        },
        ],

        Completed: [],
        Cancelled: [],
    };

    const actions = actionsByStatus[booking.status] || [];

    if (actions.length === 0) {
        return (
        <p style={{ color: "#647568", margin: 0, fontSize: 13 }}>
            {booking.status === "Completed"
            ? "Service completed successfully."
            : booking.status === "Cancelled"
            ? "This booking has been cancelled."
            : "No actions available."}
        </p>
        );
    }

    return (
        <div className="provider-booking-actions">
        {actions.map((action) => (
            <button
            key={action.status}
            type="button"
            className={`provider-booking-button ${action.className}`}
            disabled={busy}
            onClick={() => updateStatus(booking._id, action.status)}
            >
            {busy ? (
                <LoaderCircle size={17} />
            ) : (
                action.icon
            )}

            {busy ? "Updating..." : action.label}
            </button>
        ))}
        </div>
    );
    };


  return (
    <main className="provider-bookings-page">
      <style>{`
        .provider-bookings-page {
          max-width: 1050px;
          margin: 0 auto;
          padding: 28px 18px 48px;
          color: #183b2b;
          font-family: Inter, system-ui, sans-serif;
        }
        .provider-bookings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }
        .provider-bookings-header h1 {
          margin: 0 0 6px;
          font-size: clamp(24px, 4vw, 32px);
        }
        .provider-bookings-header p {
          margin: 0;
          color: #647568;
        }
        .provider-booking-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #cfe0d4;
          background: white;
          color: #205d3c;
          padding: 10px 13px;
          border-radius: 10px;
          cursor: pointer;
        }
        .provider-booking-list {
          display: grid;
          gap: 16px;
        }
        .provider-booking-card {
          background: #fff;
          border: 1px solid #dfe9e2;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(25, 70, 43, .045);
        }
        .provider-booking-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .provider-booking-card h2 {
          margin: 0 0 7px;
          font-size: 19px;
          color: #173e2b;
        }
        .provider-booking-id {
          color: #718074;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .provider-booking-status {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .provider-booking-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 14px;
          margin: 20px 0;
        }
        .provider-booking-detail {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #465b4d;
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        .provider-booking-detail svg {
          flex-shrink: 0;
          color: #26834d;
          margin-top: 2px;
        }
        .provider-booking-price {
          font-size: 20px;
          font-weight: 800;
          color: #16713b;
        }
        .provider-booking-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #edf2ee;
        }
        .provider-booking-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .provider-booking-button.accept {
          color: white;
          background: #19834a;
        }
        .provider-booking-button.reject {
          color: #b42318;
          background: white;
          border-color: #f0c7c3;
        }
        .provider-booking-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .provider-booking-message {
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          overflow-wrap: anywhere;
        }
        .provider-booking-message.error {
          background: #fef2f2;
          color: #991b1b;
        }
        .provider-booking-message.success {
          background: #ecfdf3;
          color: #166534;
        }
        .provider-booking-empty {
          text-align: center;
          padding: 48px 20px;
          border: 1px dashed #cbdccf;
          border-radius: 16px;
          color: #65776a;
          background: #fbfefc;
        }
        @media (max-width: 560px) {
          .provider-bookings-header { align-items: flex-start; }
          .provider-booking-card { padding: 15px; }
          .provider-booking-card-top { flex-direction: column; }
          .provider-booking-button { flex: 1; }
        }
      `}</style>

      <header className="provider-bookings-header">
        <div>
          <h1>Booking Requests</h1>
          <p>Manage your customer bookings and service progress.</p>
        </div>

        <button
          type="button"
          className="provider-booking-refresh"
          onClick={loadBookings}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="provider-booking-message error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="provider-booking-message success" role="status">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="provider-booking-empty">
          <LoaderCircle size={25} />
          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="provider-booking-empty">
          <CalendarDays size={35} />
          <h2>No bookings yet</h2>
          <p>New customer booking requests will appear here.</p>
        </div>
      ) : (
        <section className="provider-booking-list">
          {bookings.map((booking) => (
            <article className="provider-booking-card" key={booking._id}>
              <div className="provider-booking-card-top">
                <div>
                  <h2>{booking.serviceName || "Service Booking"}</h2>
                  <div className="provider-booking-id">
                    Booking ID: {booking._id}
                  </div>
                </div>

                <span
                  className="provider-booking-status"
                  style={STATUS_STYLES[booking.status] || {}}
                >
                  {booking.status}
                </span>
              </div>

              <div className="provider-booking-details">
                <div className="provider-booking-detail">
                  <UserRound size={18} />
                  <span>
                    <strong>Customer</strong>
                    <br />
                    {getCustomerName(booking.customer)}
                    {booking.customer?.phone && (
                      <>
                        <br />
                        {booking.customer.phone}
                      </>
                    )}
                  </span>
                </div>

                <div className="provider-booking-detail">
                  <CalendarDays size={18} />
                  <span>
                    <strong>Appointment</strong>
                    <br />
                    {formatDate(booking.bookingDate)}
                  </span>
                </div>

                <div className="provider-booking-detail">
                  <MapPin size={18} />
                  <span>
                    <strong>Service address</strong>
                    <br />
                    {booking.address || "Not provided"}
                  </span>
                </div>

                <div className="provider-booking-detail">
                  <ClipboardCheck size={18} />
                  <span>
                    <strong>Customer description</strong>
                    <br />
                    {booking.description || "No additional details"}
                  </span>
                </div>
              </div>

              <div className="provider-booking-price">
                ₹{Number(booking.price || 0).toLocaleString("en-IN")}
              </div>

              <div style={{ marginTop: 14 }}>
                {renderActions(booking)}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
