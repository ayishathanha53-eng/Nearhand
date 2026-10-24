
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ArrowLeft,
  RefreshCw,
  CalendarCheck,
  CircleCheck,
  Clock,
  XCircle,
} from "lucide-react";
import "./Notifications.css";

const API_URL = "http://localhost:5000";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in to view your notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load notifications.");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to mark notification as read.");
      }

      setNotifications((items) =>
        items.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(err.message || "Unable to update notification.");
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token || unreadCount === 0) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to mark notifications as read.");
      }

      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || "Unable to update notification.");
    }
  };

  const openNotification = async (item) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }

    // Provider notifications should open provider booking requests.
    if (item.booking?._id) {
      navigate("/provider/bookings");
    }
  };

  const getIcon = (type) => {
    if (type === "booking_confirmed") return <CircleCheck />;
    if (type === "booking_cancelled") return <XCircle />;
    if (type === "service_completed") return <CheckCheck />;
    if (type === "service_started") return <Clock />;
    return <CalendarCheck />;
  };

  return (
    <main className="notifications-page">
      <div className="notifications-topbar">
        <button
          className="notifications-back"
          onClick={() => navigate("/provider/dashboard")}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <button
          className="notifications-refresh"
          onClick={loadNotifications}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <section className="notifications-title-row">
        <div className="notifications-title-icon">
          <Bell size={25} />
        </div>
        <div>
          <h1>Notifications</h1>
          <p>Stay updated about new booking requests and service activity.</p>
        </div>
        <span className="notifications-count">
          {unreadCount} unread
        </span>
      </section>

      {unreadCount > 0 && (
        <div className="notifications-toolbar">
          <span>You have {unreadCount} unread notification(s).</span>
          <button onClick={markAllAsRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>
      )}

      {error && <div className="notifications-error">{error}</div>}

      {loading ? (
        <div className="notifications-empty">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={34} />
          <h3>You're all caught up!</h3>
          <p>New booking requests will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((item) => (
            <article
              key={item._id}
              className={`notifications-card ${item.isRead ? "is-read" : "is-unread"}`}
            >
              <div className="notifications-card-icon">
                {getIcon(item.type)}
              </div>

              <div className="notifications-card-content">
                <div className="notifications-card-heading">
                  <h3>{item.title}</h3>
                  {!item.isRead && (
                    <span className="notifications-new-badge">New</span>
                  )}
                </div>

                <p>{item.message}</p>

                <time>
                  {new Date(item.createdAt).toLocaleString()}
                </time>

                
                {item.booking && (
                <button
                    className="notification-view-btn"
                    onClick={async () => {
                    if (!item.isRead) {
                        await markAsRead(item._id);
                    }

                    if (item.booking?._id) {
                        navigate(`/provider/bookings/${item.booking._id}`);
                    } else {
                        console.error("Booking ID missing:", item);
                    }
                    }}
                >
                    View booking request
                </button>
                )}

              </div>

              {!item.isRead && (
                <button
                  className="notifications-read-button"
                  onClick={() => markAsRead(item._id)}
                >
                  Mark read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
