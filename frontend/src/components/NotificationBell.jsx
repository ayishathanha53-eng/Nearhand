
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

const API_URL = "http://localhost:5000";

export default function NotificationBell({ role = "customer" }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
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

    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [loadNotifications]);

  const markAsRead = async (notificationId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      setError(err.message || "Unable to update notification.");
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token || unreadCount === 0) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.message || "Unable to update notifications.");
    }
  };

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setOpen(false);

    if (notification.booking?._id) {
      if (role === "provider") {
        // Provider bell -> Provider booking requests page
        navigate("/provider/booking-requests");
      } else {
        // Customer bell -> Customer booking history
        navigate("/customer/booking-history");
      }
    } else {
      // Notifications without a booking open the relevant notifications page
      if (role === "provider") {
        navigate("/provider/notifications");
      } else {
        navigate("/customer/notifications");
      }
    }
  };

  return (
    <div className="nh-notification" ref={containerRef}>
      <button
        type="button"
        className="nh-notification-trigger"
        aria-label={`Notifications${
          unreadCount ? `, ${unreadCount} unread` : ""
        }`}
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);

          if (nextOpen) {
            loadNotifications();
          }
        }}
      >
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="nh-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="nh-notification-panel">
          <div className="nh-notification-heading">
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount} unread</p>
            </div>

            <button
              type="button"
              className="nh-notification-icon-button"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="nh-notification-mark-all"
              onClick={markAllAsRead}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}

          {error && (
            <p className="nh-notification-error">{error}</p>
          )}

          {loading && notifications.length === 0 ? (
            <p className="nh-notification-empty">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <div className="nh-notification-empty">
              <Bell size={25} />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="nh-notification-list">
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  className={`nh-notification-item ${
                    notification.isRead ? "" : "unread"
                  }`}
                  onClick={() => openNotification(notification)}
                >
                  <span className="nh-notification-item-icon">
                    <Clock size={18} />
                  </span>

                  <span className="nh-notification-item-content">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>
                  </span>

                  {!notification.isRead && (
                    <span className="nh-notification-unread-dot" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
