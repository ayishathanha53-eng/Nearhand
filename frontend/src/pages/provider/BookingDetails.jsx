
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, RefreshCw } from "lucide-react";
import "./BookingDetails.css";

const API_URL = "http://localhost:5000";

export default function ProviderBookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const response = await fetch(
        `${API_URL}/api/providers/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load bookings.");
      }

      const bookings = Array.isArray(data)
        ? data
        : data.bookings || [];

      const selectedBooking = bookings.find(
        (item) => String(item._id) === String(bookingId)
      );

      if (!selectedBooking) {
        throw new Error("This booking was not found in your bookings.");
      }

      setBooking(selectedBooking);
    } catch (err) {
      setError(err.message || "Could not load booking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const goBack = () => navigate("/provider/notifications");

  return (
    <main className="booking-detail-page">
      <header className="booking-detail-topbar">
        <button onClick={goBack} className="booking-detail-back">
          <ArrowLeft size={18} />
          Back to Notifications
        </button>

        <button onClick={loadBooking} className="booking-detail-refresh">
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <h1>Booking Request Details</h1>
      <p className="booking-detail-subtitle">
        Review this customer's booking request.
      </p>

      {loading && <p>Loading booking details...</p>}
      {error && <p className="booking-detail-error">{error}</p>}

      {!loading && !error && booking && (
        <section className="booking-detail-card">
          <div className="booking-detail-card-header">
            <h2>{booking.serviceName}</h2>
            <span className="booking-detail-status">
              {booking.status}
            </span>
          </div>

          <div className="booking-detail-row">
            <CalendarDays size={20} />
            <div>
              <strong>Booking date</strong>
              <p>
                {booking.bookingDate
                  ? new Date(booking.bookingDate).toLocaleString()
                  : "Not specified"}
              </p>
            </div>
          </div>

          <div className="booking-detail-row">
            <MapPin size={20} />
            <div>
              <strong>Service address</strong>
              <p>{booking.address || "Not specified"}</p>
            </div>
          </div>

          <div className="booking-detail-field">
            <strong>Customer</strong>
            <p>
              {booking.customer?.fullName ||
                booking.customer?.name ||
                "Customer"}
            </p>
          </div>

          <div className="booking-detail-field">
            <strong>Price</strong>
            <p>{booking.price ?? "Not specified"}</p>
          </div>

          <div className="booking-detail-field">
            <strong>Description</strong>
            <p>{booking.description || "No additional description."}</p>
          </div>

          

          <button
            className="booking-detail-back"
            onClick={() => navigate("/provider/bookings")}
          >
            View all booking requests
          </button>
        </section>
      )}
    </main>
  );
}
